"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema"
import envConfig from "@/config"
import { toast } from "sonner"
import { useAppContext } from "@/app/AppProvider"

const LoginForm = () => {
    const { setSessionToken } = useAppContext();
    // 1. Define your form.
    const form = useForm<LoginBodyType>({
        resolver: zodResolver(LoginBody),
        defaultValues: {
            email: '',
            password: ''
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: LoginBodyType) {
        try {
            const result = await fetch(`${envConfig.NEXT_PUBLIC_API_URL}/auth/login`, {
                body: JSON.stringify(values),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            }).then(async (res) => {
                const payload = await res.json();
                const data = {
                    status: res.status,
                    payload
                }
                if (!res.ok) {
                    throw data;
                }
                return data
            })
            toast.success(result.payload.message)
            const resultFromNextServer = await fetch('/api/auth', {
                method: 'POST',
                body: JSON.stringify(result),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(async (res) => {
                const payload = await res.json();
                const data = {
                    status: res.status,
                    payload
                }
                if (!res.ok) {
                    throw data;
                }
                return data
            })
            setSessionToken(resultFromNextServer.payload.data.token);
        } catch (error: any) {
            const errors = error.payload.errors as {
                field: string
                message: string
            }[]
            const status = error.status as number
            if (status === 422) {
                errors.forEach((error) => {
                    form.setError(error.field as 'email' | 'password', {
                        type: "server",
                        message: error.message
                    })
                })
            }
            else {
                toast.error(error.payload.message)
            }
        }
    }
    return (

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2 max-w-[600px] shrink-0 w-full"
                noValidate
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="shadcn" type="email" {...field} />
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
                            <FormLabel>Mật khẩu</FormLabel>
                            <FormControl>
                                <Input placeholder="shadcn" type="password"{...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="mt-5 w-full">Đăng nhập</Button>
            </form>
        </Form>

    )
}

export default LoginForm;