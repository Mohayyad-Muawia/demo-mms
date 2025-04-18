import supabase from "./supabase";

const uploadAvatar = async (file: File, uid: string) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${uid}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.log("Supabase Error:", error.message);
    throw new Error("فشل رفع الصورة!");
  }

  // get img url
  const { data: publicUrl } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
};

export default uploadAvatar;
