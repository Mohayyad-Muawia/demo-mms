"use server";
import {supabase} from "./supabase/supabase";
import { UserType } from "./context/useUserStore";
import uploadAvatar from "./supabase/uploadAvatar";
import { Device } from "./context/useDevicesStore";
import nodemailer from "nodemailer";
import { transliterate } from "transliteration";
import { SparePart } from "./spares/page";

const getUser = async (username: string) => {
  // البحث عن البريد الإلكتروني باستخدام اسم المستخدم
  const { data: user, error } = await supabase
    .from("users")
    .select()
    .eq("username", username)
    .single();

  if (error) {
    console.error("Supabase Error:", error.message);
    return { error: "المستخدم غير موجود" };
  }

  return user;
};

export async function server_login(
  formData: FormData
): Promise<{ success?: boolean; error?: string; user?: UserType }> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const user = await getUser(username);

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password,
  });

  if (error) {
    console.error("Supabase Error:", error.message);
    return { error: "خطأ في اسم المستخدم أو كلمة المرور" };
  }

  return {
    success: true,
    user: {
      username: user.username,
      fullname: user.fullname,
      avatar: user.avatar || "/avtr.png",
      role: user.role,
    },
  };
}

export async function server_editProfile(formData: FormData) {
  const username = formData.get("username") as string;
  const fullname = formData.get("fullname") as string;
  const avatar = formData.get("avatar") as File;

  const user = await getUser(username);
  const uid = user.id;

  const avatarUrl = avatar ? await uploadAvatar(avatar, uid) : null;

  // update user
  const { data: updatedUser, error } = await supabase
    .from("users")
    .update({
      fullname,
      avatar: avatarUrl,
    })
    .eq("username", username)
    .select()
    .maybeSingle();

  if (error) {
    return { error: error.message || "حدث خطأ أثناء تحديث البيانات" };
  }

  if (!updatedUser) {
    return { error: "المستخدم غير موجود أو لم يتم تحديث البيانات" };
  }

  return {
    success: true,
    user: {
      username: updatedUser.username,
      fullname: updatedUser.fullname,
      avatar: updatedUser.avatar || "/avtr.png",
      role: updatedUser.role,
    },
  };
}

// devices actions
export async function server_getDevices() {
  const {
    data: devices,
    error,
  }: { data: Device[] | null; error: Error | null } = await supabase
    .from("devices")
    .select("*");

  return { devices, error };
}

export async function server_getAvailableMonths() {
  const { data, error } = await supabase.from("devices").select("created_at");

  if (error || !data) return { months: [], error };

  // استخراج الأشهر الفريدة بصيغة { month: رقم الشهر, year: السنة }
  const uniqueMonths = Array.from(
    new Set(
      data.map((device) => {
        const date = new Date(device.created_at);
        return `${date.getFullYear()}-${date.getMonth() + 1}`; // "2024-3"
      })
    )
  ).map((m) => {
    const [year, month] = m.split("-").map(Number);
    return { month, year };
  });

  return { months: uniqueMonths, error: null };
}

export async function server_getDevicesInDate(month: number, year: number) {
  // تحديد بداية ونهاية الشهر
  const startDate = new Date(year, month - 1, 1).toISOString(); // بداية الشهر
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString(); // نهاية الشهر

  const {
    data: devices,
    error,
  }: { data: Device[] | null; error: Error | null } = await supabase
    .from("devices")
    .select("*")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  return { devices, error };
}

export async function server_addDevice(device: Device) {
  const { data, error } = await supabase
    .from("devices")
    .insert(device)
    .select()
    .single();

  if (error) {
    return {
      error: "حدث خطأ اثناء اضافة الجهاز",
    };
  }
  if (data) {
    return {
      success: true,
      device: data,
    };
  }
}

export async function server_updateDevice(device: Device) {
  if (!device.id) {
    return {
      error: "معلومات الجهاز غير مكتملة (المعرف مفقود)",
    };
  }

  const { data, error } = await supabase
    .from("devices")
    .update(device)
    .eq("id", device.id)
    .select()
    .single();

  if (error) {
    console.log("supabase error: ", error.message);
    return {
      error: "حدث خطأ اثناء تحديث الجهاز",
    };
  }

  if (data) {
    return {
      success: true,
      device: data,
    };
  }

  return {
    error: "لم يتم العثور على الجهاز لتحديثه",
  };
}

// Search
export async function searchDevices(query: string, type: string) {
  // 🔹 لو الاستعلام فاضي، نرجع مصفوفة فاضية بدون تنفيذ البحث
  if (!query.trim()) return { success: true, devices: [] };

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .ilike(type, `%${query}%`); // 🔹 البحث غير حساس لحجم الأحرف

  if (error)
    return { success: false, error: "حدث خطأ أثناء البحث", devices: [] };

  return { success: true, devices: data || [] };
}

// Report a problem
export async function sendReport(formData: FormData) {
  const name = formData.get("name") as string;
  const message = formData.get("message") as string;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${name}" <${process.env.EMAIL_USER}>`,
    to: "mohayyad2.0@gmail.com",
    subject: "إبلاغ جديد",
    html: `<p><strong>الاسم:</strong> ${name}</p>
               <p><strong>المشكلة:</strong> ${message}</p>`,
  });

  return { success: true, message: "تم إرسال الإبلاغ بنجاح!" };
}


// users
export async function getAllUsers() {
  const { data: users, error } = await supabase.from("users").select();

  if (error) {
    throw error.message;
  }

  return users;
}

export async function AddNewUser(formData: FormData) {
  const fullname = formData.get("fullname") as string;
  const username = formData.get("username") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;
  
  const email = createFakeEmail(username)

  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
  })
  
  if (error) {
    console.error('Error Adding up:', error.message)
      return { error: "خطأ اثناء اضافة المستخدم" };

  }
  
  const { data: user, error: userErr } = await supabase.from("users").insert({
    fullname, username, role, email
  }).select().single()
  
  if (userErr) {
    console.error("Supabase Error:", userErr.message);
    return { error: "خطأ اثناء اضافة المستخدم" };
  }

  return {
    success: true,
    user: {
      username: user.username,
      fullname: user.fullname,
      avatar: user.avatar || "/avtr.png",
      role: user.role,
    },
  };

}

function createFakeEmail(uname: string) {
    const email = `${transliterate(uname)}@mms.sd`
    return email
}


// spares
export async function getAllSpares(){
  const { data: spares, error } = await supabase.from("spares").select();

  if (error) {
    throw error.message;
  }

  return spares;
}

export async function addNewSpare(data: SparePart) {
  const { name, category, quantity, maxQuantity, price } = data;

  if (
    !name ||
    !category ||
    isNaN(quantity) ||
    isNaN(maxQuantity) ||
    isNaN(price)
  ) {
    return { error: "الرجاء ملء كل الحقول بشكل صحيح" };
  }

  const { data: spare, error } = await supabase
    .from("spares")
    .insert({
      name,
      category,
      quantity,
      maxQuantity,
      price,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase Error:", error.message);
    return { error: "خطأ اثناء اضافة الاسبير" };
  }

  return {
    success: true,
    spare,
  };
}


export async function updateSpare(id: string, data: SparePart) {
  const { name, category, quantity, maxQuantity, price } = data;

  if (
    !name ||
    !category ||
    isNaN(quantity) ||
    isNaN(maxQuantity) ||
    isNaN(price)
  ) {
    return { error: "الرجاء ملء كل الحقول بشكل صحيح" };
  }

  const { data: spare, error } = await supabase
    .from("spares")
    .update({
      name,
      category,
      quantity,
      maxQuantity,
      price,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase Error:", error.message);
    return { error: "خطأ اثناء تعديل الاسبير" };
  }

  return {
    success: true,
    spare,
  };
}


export async function takeSpare(id: string, takenQuantity: number) {
  if (!takenQuantity || takenQuantity <= 0) {
    return { error: "الرجاء إدخال كمية صحيحة" };
  }

  const { data: currentSpare, error: fetchError } = await supabase
    .from("spares")
    .select("quantity")
    .eq("id", id)
    .single();

  if (fetchError || !currentSpare) {
    console.error("Supabase Error:", fetchError?.message);
    return { error: "فشل في جلب بيانات الاسبير" };
  }

  // نتحقق من الكمية المتاحة
  if (currentSpare.quantity < takenQuantity) {
    return { error: "الكمية المدخلة أكبر من الكمية المتاحة" };
  }

  // نخصم الكمية
  const newQuantity = currentSpare.quantity - takenQuantity;

  // نحدث الكمية في القاعدة
  const { data: updatedSpare, error: updateError } = await supabase
    .from("spares")
    .update({ quantity: newQuantity })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("Supabase Error:", updateError.message);
    return { error: "حدث خطأ أثناء تحديث كمية الاسبير" };
  }

  return {
    success: true,
    spare: updatedSpare,
  };
}
