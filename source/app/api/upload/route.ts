import { NextResponse } from "next/server";
import cloudinary from "../../lib/cloudinary";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

    console.log("Preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
    console.log("Cloudname:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

  if (!file) {
    return NextResponse.json({ error: "Geen bestand ontvangen." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          },
          function (error, result) {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ secure_url: result.secure_url }); 
  } catch (err) {
    console.error("Upload fout:", err);
    return NextResponse.json({ error: "Upload is mislukt." }, { status: 500 });
  }
}