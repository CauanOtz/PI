import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { LockIcon, MailIcon, LogInIcon } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { toast } from "sonner"; 

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success("Bem-vindo! Login realizado com sucesso.");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.mensagem || "Falha ao entrar");
    }
  };

  return (
    <div className="min-h-screen bg-[#152259] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img src="/logoAng.png" alt="Logo da ANG" className="w-[65px] h-[65px] object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Bem-vindo de volta!</h1>
          <p className="text-gray-600 mt-2">Entre com suas credenciais para acessar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              {...register("email")}
              type="email"
              placeholder="Seu email"
              className="pl-10 w-full h-12 bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1 block">{errors.email.message}</span>
            )}
          </div>

          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              {...register("password")}
              type="password"
              placeholder="Sua senha"
              className="pl-10 w-full h-12 bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.password && (
              <span className="text-red-500 text-sm mt-1 block">{errors.password.message}</span>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-12 bg-projectsecondary-300 hover:bg-projectsecondary-300/90 text-white font-semibold flex items-center justify-center gap-2 mt-6"
          >
            <LogInIcon className="w-5 h-5" />
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

      </div>
    </div>
  );
};