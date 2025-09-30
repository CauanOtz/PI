// React import removed (new JSX runtime)
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { UserIcon, MailIcon, LockIcon, UserPlusIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    console.log(data);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#152259] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Avatar className="w-[65px] h-[65px]">
              <AvatarImage src="/ellipse-6.png" alt="Logo da escola" />
              <AvatarFallback>ES</AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Criar Conta</h1>
          <p className="text-gray-600 mt-2">Preencha os dados para começar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              {...register("name")}
              placeholder="Seu nome completo"
              className="pl-10 w-full h-12 bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.name && (
              <span className="text-red-500 text-sm mt-1 block">{errors.name.message}</span>
            )}
          </div>

          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              {...register("email")}
              type="email"
              placeholder="Seu melhor email"
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
              placeholder="Crie uma senha forte"
              className="pl-10 w-full h-12 bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.password && (
              <span className="text-red-500 text-sm mt-1 block">{errors.password.message}</span>
            )}
          </div>

          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirme sua senha"
              className="pl-10 w-full h-12 bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm mt-1 block">{errors.confirmPassword.message}</span>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-projectsecondary-300 hover:bg-projectsecondary-300/90 text-white font-semibold flex items-center justify-center gap-2 mt-6"
          >
            <UserPlusIcon className="w-5 h-5" />
            Criar conta
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{" "}
            <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};