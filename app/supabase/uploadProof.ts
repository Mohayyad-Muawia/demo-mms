import {supabase} from "./supabase";

const uploadProof = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${new Date().getTime()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from("proofs")
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.log("Supabase Error:", error.message);
    throw new Error(error.message);
  }

  // الحصول على رابط الصورة
  const { data: publicUrl } = supabase.storage
    .from("proofs")
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
};

export default uploadProof;
