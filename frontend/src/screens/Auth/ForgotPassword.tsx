// React import removed (new JSX runtime)
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { MailIcon, ArrowLeftIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    // Here you would typically make an API call to handle password reset
    console.log(data);
    toast.success("Link de recuperação enviado para seu email!");
  };

  return (
    <div className="min-h-screen bg-[#152259] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Avatar className="w-[65px] h-[65px]">
              <AvatarImage src="/logoAng.png" alt="Logo da ANG" />
              <AvatarFallback>ES</AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Esqueceu sua senha?</h1>
          <p className="text-gray-600 mt-2">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              {...register("email")}
              type="email"
              placeholder="Seu email cadastrado"
              className="pl-10 w-full h-12 bg-white border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-projectsecondary-300 hover:bg-projectsecondary-300/90 text-white font-semibold"
          >
            Enviar link de recuperação
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
};