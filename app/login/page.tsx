"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, ArrowRight, Bot, MessageCircle, ShieldCheck, Zap, FileText, CreditCard, Bell, TrendingUp, Users, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error("Error signing in:", error.message)
                alert("Error: " + error.message) // Simple alert for now, can be improved to UI banner
            } else {
                router.push('/dashboard')
            }
        } catch (err) {
            console.error("Unexpected error:", err)
            alert("Ocurrió un error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    // The orbiting planets (Tags)
    const orbitItems = [
        { icon: FileText, text: "Nueva Póliza", color: "text-blue-400", bg: "bg-blue-500/20", borderColor: "border-blue-500/30", radius: 280, duration: 25, delay: 0 },
        { icon: CreditCard, text: "Cobro Exitoso", color: "text-emerald-400", bg: "bg-emerald-500/20", borderColor: "border-emerald-500/30", radius: 280, duration: 25, delay: 4 }, // ~1/6th around
        { icon: Bell, text: "Notificación", color: "text-amber-400", bg: "bg-amber-500/20", borderColor: "border-amber-500/30", radius: 280, duration: 25, delay: 8 },
        { icon: TrendingUp, text: "Ventas +15%", color: "text-rose-400", bg: "bg-rose-500/20", borderColor: "border-rose-500/30", radius: 280, duration: 25, delay: 12.5 },
        { icon: Users, text: "Cliente Feliz", color: "text-cyan-400", bg: "bg-cyan-500/20", borderColor: "border-cyan-500/30", radius: 280, duration: 25, delay: 16.5 },
        { icon: ShieldCheck, text: "100% Seguro", color: "text-purple-400", bg: "bg-purple-500/20", borderColor: "border-purple-500/30", radius: 280, duration: 25, delay: 20.5 },
    ]

    return (
        <div className="min-h-screen w-full flex bg-white overflow-hidden">

            {/* Left Side - Form Section */}
            <div className="w-full lg:w-5/12 flex items-center justify-center p-8 lg:p-12 relative z-20 bg-white shadow-2xl lg:shadow-none">
                <div className="w-full max-w-md space-y-8">

                    <div className="space-y-2">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-emerald-600 mb-6"
                        >
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">Seguros RB</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl font-extrabold tracking-tight text-slate-900"
                        >
                            Bienvenido de nuevo
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 text-lg"
                        >
                            Inteligencia Artificial trabajando para tu cartera.
                        </motion.p>
                    </div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onSubmit={handleLogin}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Correo Electrónico</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                        placeholder="nombre@empresa.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-3.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                <span className="text-sm text-slate-600">Recordarme</span>
                            </label>
                            <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "w-full flex items-center justify-center py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all",
                                isLoading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Iniciar Sesión <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </motion.button>
                    </motion.form>
                </div>
            </div>

            {/* Right Side - ORBITING ROBOT ECOSYSTEM */}
            <div className="hidden lg:flex w-7/12 bg-black relative items-center justify-center overflow-hidden">

                {/* Background Depth */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-150 contrast-150" />

                <div className="relative w-[800px] h-[800px] flex items-center justify-center">

                    {/* --- CENTRAL ROBOT CORE --- */}
                    <div className="relative z-20 isolate">
                        {/* Outer Glow Halo */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -z-10"
                        />

                        {/* The "Head" / Core Interface */}
                        <div className="relative bg-slate-900 border border-slate-700 p-1 rounded-3xl shadow-2xl">
                            <div className="w-32 h-32 bg-slate-950 rounded-[20px] relative overflow-hidden flex items-center justify-center border border-slate-800">
                                {/* Scanning Eye Line */}
                                <motion.div
                                    animate={{ top: ["10%", "90%", "10%"] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-full h-[2px] bg-emerald-400 shadow-[0_0_10px_#34d399] z-10 opacity-70"
                                />
                                <Bot className="w-20 h-20 text-slate-700 relative z-0" strokeWidth={1} />

                                {/* Face Digital Elements */}
                                <div className="absolute inset-0 flex items-center justify-center gap-2">
                                    <motion.div
                                        animate={{ height: [10, 30, 10] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                        className="w-2 bg-emerald-500 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ height: [15, 40, 15] }}
                                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                                        className="w-2 bg-emerald-500 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ height: [10, 30, 10] }}
                                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                                        className="w-2 bg-emerald-500 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* "Working" Status Badge */}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-full flex gap-2 items-center whitespace-nowrap">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
                            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Procesando</span>
                        </div>
                    </div>

                    {/* --- ORBITAL TRACKS --- */}
                    {/* Visual rings just to show the path */}
                    <div className="absolute border border-slate-800/30 rounded-full w-[560px] h-[560px]" />
                    <div className="absolute border border-slate-800/20 rounded-full w-[700px] h-[700px]" />


                    {/* --- ORBITING CARDS --- */}
                    {/* We rotate the entire container, and counter-rotate the items so they stay upright */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    >
                        {orbitItems.map((item, index) => (
                            <motion.div
                                key={index}
                                className="absolute top-1/2 left-1/2 w-0 h-0"
                                style={{ transform: `rotate(${index * (360 / orbitItems.length)}deg)` }}
                            >
                                <div
                                    className="absolute -translate-x-1/2 -translate-y-1/2"
                                    style={{ transform: `translate(${item.radius}px, 0)` }}
                                >
                                    {/* Counter-Rotate Wrapper */}
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, zIndex: 50 }}
                                            className={cn(
                                                "flex items-center gap-3 p-3 pr-4 rounded-xl border backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors",
                                                "bg-slate-900/60",
                                                item.borderColor
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-lg", item.bg)}>
                                                <item.icon className={cn("w-5 h-5", item.color)} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn("text-xs font-bold leading-none mb-1", item.color)}>{item.text}</span>
                                                <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={cn("h-full", item.color.replace("text-", "bg-"))}
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: Math.random() * 5 }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </div>
        </div>
    )
}
