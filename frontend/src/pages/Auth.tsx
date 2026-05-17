import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Auth({ setToken }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "sales",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // LOGIN
  const handleLogin = async (e: any) => {
  e.preventDefault();

  console.log("LOGIN CLICKED");

  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email: form.email,
      password: form.password,
    });

    console.log("LOGIN RESPONSE:", res.data);

    localStorage.setItem("token", res.data.token);

    setToken(res.data.token); // VERY IMPORTANT

    toast.success("Login successful");
  } catch (err: any) {
    console.log("LOGIN ERROR:", err.response?.data || err.message);
    toast.error("Login Failed");
  }
};
  // REGISTER
  const handleRegister = async (e: any) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:5000/api/auth/register", {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    });

    toast.success("Account created successfully 🎉");

    // 👉 AUTO LOGIN AFTER REGISTER (IMPORTANT PART)
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: form.email,
      password: form.password,
    });

    localStorage.setItem("token", loginRes.data.token);
    setToken(loginRes.data.token);

    toast.success("Logged in successfully 🚀");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Signup Failed");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md bg-[#1E293B] rounded-3xl shadow-2xl overflow-hidden border border-slate-700">

        {/* HEADER */}
        <div className="relative flex bg-[#0B1220]">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-4 font-semibold z-10 ${
              isLogin ? "text-white" : "text-slate-400"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-4 font-semibold z-10 ${
              !isLogin ? "text-white" : "text-slate-400"
            }`}
          >
            Signup
          </button>

          <div
            className={`absolute top-0 h-full w-1/2 bg-gradient-to-r from-sky-600 to-cyan-500 transition-all duration-300 ${
              isLogin ? "left-0" : "left-1/2"
            }`}
          />
        </div>

        {/* FORM */}
        <form
          onSubmit={isLogin ? handleLogin : handleRegister}
          className="p-8 space-y-4"
        >
          {/* NAME */}
          {!isLogin && (
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-[#111827] text-white"
            />
          )}

          {/* EMAIL */}
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-[#111827] text-white"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-[#111827] text-white pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          {!isLogin && (
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-[#111827] text-white"
            />
          )}

          {/* ROLE */}
          {!isLogin && (
            <select
              name="role"
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-[#111827] text-white"
            >
              <option value="sales">Sales</option>
              <option value="admin">Admin</option>
            </select>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-cyan-400 py-3 rounded-xl text-white font-semibold"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
