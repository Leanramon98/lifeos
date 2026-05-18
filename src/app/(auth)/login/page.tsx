"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Logo } from "@/components/layout/Logo";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await signInWithEmail(values.email, values.password);
      router.push("/inicio");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error al iniciar sesión");
      } else {
        toast.error("Error al iniciar sesión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push("/inicio");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error al iniciar sesión con Google");
      } else {
        toast.error("Error al iniciar sesión con Google");
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      <Logo className="mb-4" />

      <Card className="w-full shadow-soft rounded-card-lg border-border">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex justify-between items-center mb-4 text-sm font-medium">
            <span className="text-foreground border-b-2 border-primary pb-1">Login</span>
            <Link href="/signup" className="text-foreground-secondary hover:text-foreground">
              Signup
            </Link>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">Bienvenido de nuevo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Cargando..." : "Entrar"}
              </Button>
            </form>
          </Form>

          <div className="flex items-center space-x-2 text-sm text-foreground-secondary py-2">
            <Separator className="flex-1" />
            <span>o</span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin}>
            Continuar con Google
          </Button>

          <div className="text-center mt-4">
            <Link href="#" className="text-sm text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
