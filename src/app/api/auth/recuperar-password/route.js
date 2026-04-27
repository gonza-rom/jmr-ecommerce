// // src/app/api/auth/recuperar-password/route.js
// // Endpoint que dispara el reset de contraseña de Supabase
// // y envía el email de recuperación con nuestro template de Brevo.
// //
// // Llamado desde auth/login/page.js en el handleRecuperar().

// import { NextResponse }           from "next/server";
// import { createServerClient }     from "@supabase/ssr";
// import { cookies }                from "next/headers";
// import { enviarRecuperarPassword } from "@/emails/recuperar-password";
// import { prisma }                  from "@/lib/prisma";

// export const dynamic = "force-dynamic";

// export async function POST(req) {
//   try {
//     const { email } = await req.json();

//     if (!email?.trim()) {
//       return NextResponse.json({ ok: false, error: "Email requerido" }, { status: 400 });
//     }

//     const emailNorm = email.trim().toLowerCase();
//     const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "https://jmrmarroquineria.com.ar";

//     // Crear cliente Supabase server-side
//     const cookieStore = await cookies();
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//       {
//         cookies: {
//           getAll: () => cookieStore.getAll(),
//           setAll: () => {},
//         },
//       }
//     );

//     // Generar el link de reset en Supabase
//     // Supabase envía su propio email por defecto — lo interceptamos
//     const { data, error } = await supabase.auth.resetPasswordForEmail(emailNorm, {
//       redirectTo: `${appUrl}/auth/callback?redirect=/auth/reset-password`,
//     });

//     if (error) {
//       console.error("[Recuperar password] Error Supabase:", error.message);
//       // Devolvemos ok:true igual para no revelar si el email existe
//       return NextResponse.json({ ok: true });
//     }

//     // Buscar el nombre del usuario en nuestra BD
//     let nombre = "Cliente";
//     try {
//       const cliente = await prisma.cliente.findUnique({
//         where:  { email: emailNorm },
//         select: { nombre: true },
//       });
//       if (cliente?.nombre) nombre = cliente.nombre;
//     } catch { /* si no existe en nuestra BD no pasa nada */ }

//     // Nota: Supabase no devuelve el link directamente en el plan gratuito.
//     // El link se incluye en el email nativo que Supabase envía.
//     // Para sobreescribir completamente el email de Supabase con Brevo,
//     // necesitás el plan Pro con Email Hooks.
//     //
//     // En plan gratuito, la mejor estrategia es:
//     // A) Usar el email nativo de Supabase (ya funciona por defecto)
//     // B) Personalizar el template en Supabase → Authentication → Email Templates
//     //
//     // El email de Brevo se puede usar como COMPLEMENTO (enviar un segundo email
//     // recordatorio con nuestro diseño), pero el link real viene de Supabase.
//     //
//     // Si tenés plan Pro, descomentá esto:
//     // if (data?.properties?.email_otp) {
//     //   const resetUrl = `${appUrl}/auth/reset-password?token=${data.properties.email_otp}`;
//     //   await enviarRecuperarPassword({ email: emailNorm, nombre, resetUrl });
//     // }

//     console.log(`[Recuperar password] Reset solicitado para: ${emailNorm}`);
//     return NextResponse.json({ ok: true });

//   } catch (error) {
//     console.error("[Recuperar password] Error:", error.message);
//     // Siempre devolver ok:true para no revelar si el email existe
//     return NextResponse.json({ ok: true });
//   }
// }