import { authFormSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "./ui/form";
import CustomInput from "./CustomInput";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AuthForm = ({ type }: { type: string }) => {

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    
    setIsLoading(true);
    try {
      if (type === "signup") {
        const response = await axios.post(
          'http://localhost:5000/api/signup',
          {
            username: data.username,
            email: data.email,
            password: data.password,
          }
        );

        if (response.data.success) {
          localStorage.setItem("authToken", response.data.authToken);
          navigate("/");
        } else {
          console.log("Login failed:", response.data.error);
        }
      }

      if (type === "login") {
        const response = await axios.post(
          'http://localhost:5000/api/login',
          {
            email: data.email,
            password: data.password,
          }
        );

        if (response.data.success) {
          localStorage.setItem("authToken", response.data.authToken);
          navigate("/");
        } else {
          console.log("Login failed:", response.data.error);
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-1/2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {type === "signup" && (
            <CustomInput
              control={form.control}
              name="username"
              label="Username"
              placeholder="Enter your username"
            />
          )}
          <CustomInput
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter your email"
          />
          <CustomInput
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
          />
          <div className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
                </>
              ) : type === "login" ? (
                "Login"
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <footer className="flex justify-center gap-1">
        <p className="text-14 font-normal text-gray-600">
          {type === "login" ? "Don't have an account?" : "Already have an account?"}
        </p>
        <Link to={type === "login" ? "/signup" : "/login"} className="form-link">
          {type === "login" ? "Sign Up" : "Login"}
        </Link>
      </footer>
    </section>
  );
};

export default AuthForm;
