"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/use-auth";

interface OAuth2Type {
    username: string,
    password: string
}

export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm<OAuth2Type>();
    const { loginMutation } = useAuth();

    const onSubmit = (data: OAuth2Type) => {
        const formData = new FormData();
        formData.append("username", data.username);
        formData.append("password", data.password);
        loginMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-sm shadow-md bg-base-100">
                <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
                    <h2 className="text-2xl font-bold text-center">Bookmory</h2>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Usuario</legend>
                        <input {...register("username", { required: "El usuario es obligatorio" })}
                            type="text"
                            className={`input input-bordered ${errors.username ? 'input-error' : ''}`} />
                        {errors.username && <span className="text-error text-xs mt-1">{errors.username.message as string}</span>}
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Contraseña</legend>
                        <input {...register("password", { required: "La contraseña es obligatoria" })}
                            type="password"
                            className={`input input-bordered ${errors.password ? 'input-error' : ''}`} />
                        {errors.password && <span className="text-error text-xs mt-1">{errors.password.message as string}</span>}
                    </fieldset>

                    {loginMutation.isError && (
                        <div className="alert alert-error text-sm py-2 mt-2">Error de credenciales</div>
                    )}

                    <div className="form-control mt-6">
                        <button className="btn btn-block btn-primary">
                            {loginMutation.isPending && <span className="loading loading-spinner"></span>}
                            Entrar
                        </button>
                    </div>
                    <p className="text-center mt-2">¿Nuevo aquí? <Link href="/register" className="link">Regístrate</Link></p>
                </form>
            </div>
        </div>
    );
}