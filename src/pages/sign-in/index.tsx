import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Field, FieldError, FieldGroup, FieldLabel, Input } from "@/components/ui";
import { NavLink } from "react-router-dom";

const signInSchema = z.object({
  email: z.email({ error: "올바른 형식의 이메일 주소를 입력해주세요." }),
  password: z.string().min(8, { error: "비밀번호는 최소 8자 이상이어야 합니다." }),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignIn() {
  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: SignInForm) {
    console.log(data);
  }

  return (
    <main className="w-full h-screen min-h-[720px] flex items-center justify-center p-6 gap-6">
      <div className="w-100 max-w-100 flex flex-col px-6 gap-6">
        <div className="flex flex-col">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">로그인</h4>
          <p className="text-muted-foreground">로그인을 위한 정보를 입력해주세요.</p>
        </div>
        <div className="grid gap-3">
          {/* 소셜 로그인 */}
          <Button type="button" variant="secondary">
            <img src="/assets/icons/social/google.svg" alt="@GOOGLE-LOGO" className="w-[18px] h-[18px] mr-1" />
            구글 로그인
          </Button>
          {/* 경계선 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 text-muted-foreground bg-black uppercase">OR CONTINUE WITH</span>
            </div>
          </div>
          {/* 로그인 폼 */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="gap-4">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-in-email">이메일</FieldLabel>
                    <Input
                      id="sign-in-email"
                      placeholder="이메일을 입력해주세요."
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs" />}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-in-password">비밀번호</FieldLabel>
                    <Input
                      id="sign-in-password"
                      type="password"
                      placeholder="비밀번호를 입력해주세요."
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs" />}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="w-full flex flex-col gap-3">
              <Button type="submit" variant="outline" className="flex-1 !bg-sky-800/50">
                로그인
              </Button>
              <div className="text-center">
                계정이 없으신가요?
                <NavLink to="/sign-up" className="underline ml-1">
                  회원가입
                </NavLink>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
