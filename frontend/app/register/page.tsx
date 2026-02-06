"use client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/use-auth";

export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { registerMutation } = useAuth();
    const router = useRouter();

    const onSubmit = (data: any) => {
        registerMutation.mutate(data, {
            onSuccess: () => router.push("/login"),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md shadow-2xl bg-base-100">
                <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
                    <h2 className="text-2xl font-bold text-center">Nueva Cuenta</h2>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Nombre de Usuario</legend>
                        <input {...register("username", { required: "Campo requerido" })}
                            type="text"
                            className={`input input-bordered ${errors.username ? 'input-error' : ''}`} />
                        {errors.username && <span className="text-error text-xs mt-1">{errors.username.message as string}</span>}
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Email</legend>
                        <input  {...register("email", {
                            required: "Campo requerido",
                            pattern: { value: /^\S+@\S+$/i, message: "Email inválido" }
                        })}
                            className={`input input-bordered ${errors.email ? 'input-error' : ''}`} />
                        {errors.email && <span className="text-error text-xs mt-1">{errors.email.message as string}</span>}
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Contraseña</legend>
                        <input {...register("password", {
                            required: "Campo requerido",
                            minLength: { value: 6, message: "Mínimo 6 caracteres" }
                        })}
                            type="password"
                            className={`input input-bordered ${errors.password ? 'input-error' : ''}`} />
                        {errors.password && <span className="text-error text-xs mt-1">{errors.password.message as string}</span>}
                    </fieldset>

                    <div className="form-control mt-6">
                        <button className="btn btn-block btn-secondary">Registrarse</button>
                    </div>
                </form>
            </div>
        </div>
    );
}