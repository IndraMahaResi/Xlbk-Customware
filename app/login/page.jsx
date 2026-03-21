"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Email atau password salah");
        return;
      }

      // ✅ cukup simpan user aja
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login berhasil 🚀");

      if (data.user.role === "OWNER" || data.user.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error("Server error, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative z-10 py-20">
      {/* Glow background */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
      w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"
      ></div>

      {/* Card */}
      <div
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl 
      p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl"
      >
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold text-blue-400">
            XLBK Customwear
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Selamat Datang</h1>
          <p className="text-sm text-slate-400">Masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <input
            type="email"
            required
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 
            rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* PASSWORD */}
          <input
            type="password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 
            rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold 
            hover:bg-blue-500 transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-sm text-center text-slate-400 mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-blue-400">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
