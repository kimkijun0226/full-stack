import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Checkbox, Field, FieldError, FieldGroup, FieldLabel, Input, Label, Separator } from "@/components/ui";
import { useAuth, useImageUpload } from "@/hooks";
import { NavLink } from "react-router-dom";
import { ArrowLeft, Asterisk, ChevronRight, ImageOff, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppProfileUpload } from "@/components/common";

const signUpSchema = z
  .object({
    email: z.email({ error: "올바른 형식의 이메일 주소를 입력해주세요." }),
    password: z.string().min(8, { error: "비밀번호는 최소 8자 이상이어야 합니다." }),
    confirmPassword: z.string().min(8, { error: "비밀번호 확인을 입력해주세요." }),
    nickname: z.string(),
    profile_image: z.union([z.string(), z.instanceof(File), z.null()]).optional(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "비밀번호가 일치하지 않습니다.",
        path: ["confirmPassword"],
      });
    }
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const { signUp, supabaseGetSession, checkEmailDuplicate } = useAuth();
  const { upload } = useImageUpload();
  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", nickname: "", profile_image: null },
  });

  const [serviceAgreed, setServiceAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailValue = form.watch("email");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const isValidEmail = z.string().email().safeParse(emailValue).success;
    if (!isValidEmail) return;

    debounceRef.current = setTimeout(() => {
      checkEmailDuplicate.mutate(emailValue, {
        onSuccess: (duplicate) => {
          if (duplicate) {
            form.setError("email", { message: "이미 사용 중인 이메일입니다." });
          } else {
            form.clearErrors("email");
          }
        },
      });
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailValue]);

  // 이미 로그인된 경우 홈으로
  useEffect(() => {
    supabaseGetSession.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: SignUpForm) => {
    if (!serviceAgreed || !privacyAgreed) {
      toast.warning("서비스 이용약관 및 개인정보 수집 및 이용 동의를 동의해주세요.");
      return;
    }

    const thumbnailUrl = await upload.mutateAsync(values.profile_image || null);

    if (!thumbnailUrl && values.profile_image) {
      toast.error("프로필 이미지 업로드에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    signUp.mutate({
      email: values.email,
      password: values.password,
      nickname: values.nickname ?? "",
      profile_image: thumbnailUrl,
      service_agreed: serviceAgreed,
      privacy_agreed: privacyAgreed,
      marketing_agreed: marketingAgreed,
    });
  };

  return (
    <main className="w-full min-h-screen  flex items-center justify-center p-6 gap-6">
      <div className="w-100 max-w-100 flex flex-col px-6 gap-6">
        <div className="flex flex-col">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">회원 가입</h4>
          <p className="text-muted-foreground">회원 가입을 위한 정보를 입력해주세요.</p>
        </div>
        <div className="grid gap-3">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="gap-4">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="relative inline-flex items-start">
                      <FieldLabel htmlFor="sign-up-email">이메일</FieldLabel>
                      <Asterisk size={12} className="text-[#F96859] -mt-0.5" />
                    </div>

                    <div className="relative">
                      <Input
                        id="sign-up-email"
                        placeholder="이메일을 입력해주세요."
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      {checkEmailDuplicate.isPending && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs" />}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="relative inline-flex items-start">
                      <FieldLabel htmlFor="sign-up-password">비밀번호</FieldLabel>
                      <Asterisk size={12} className="text-[#F96859] -mt-0.5" />
                    </div>

                    <Input
                      id="sign-up-password"
                      type="password"
                      placeholder="비밀번호를 입력해주세요."
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs" />}
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="relative inline-flex items-start">
                      <FieldLabel htmlFor="sign-up-confirm-password">비밀번호 확인</FieldLabel>
                      <Asterisk size={12} className="text-[#F96859] -mt-0.5" />
                    </div>

                    <Input
                      id="sign-up-confirm-password"
                      type="password"
                      placeholder="비밀번호 확인을 입력해주세요."
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs" />}
                  </Field>
                )}
              />
              <Controller
                name="nickname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-up-nickname">닉네임</FieldLabel>
                    <Input
                      id="sign-up-nickname"
                      type="text"
                      placeholder="닉네임을 입력해주세요."
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs" />}
                  </Field>
                )}
              />
              <Controller
                name="profile_image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-up-profile-image">프로필 이미지</FieldLabel>
                    <AppProfileUpload file={field.value ?? null} setFile={field.onChange} />
                    <Button type="button" variant="outline" className="border-0" onClick={() => field.onChange(null)}>
                      <ImageOff />
                      프로필 이미지 제거
                    </Button>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs" />}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="grid gap-2">
              <div className="grid gap-2">
                <div className="flex gap-2 items-center">
                  <Asterisk size={14} className="text-[#F96859]" />
                  <Label>필수 동의 항목</Label>
                </div>
                <div className="flex flex-col">
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        className="w-[18px] h-[18px]"
                        checked={serviceAgreed}
                        onCheckedChange={(checked) => setServiceAgreed(checked === true)}
                      />
                      서비스 이용 약관 동의
                    </div>
                    <Button type="button" variant="link" className="!p-0 gap-1">
                      <p className="text-xs">자세히 보기</p>
                      <ChevronRight className="mt-[2px]" />
                    </Button>
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        className="w-[18px] h-[18px]"
                        checked={privacyAgreed}
                        onCheckedChange={(checked) => setPrivacyAgreed(checked === true)}
                      />
                      개인정보 수집 및 이용 동의
                    </div>
                    <Button type="button" variant="link" className="!p-0 gap-1">
                      <p className="text-xs">자세히 보기</p>
                      <ChevronRight className="mt-[2px]" />
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label>선택 동의 항목</Label>
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      className="w-[18px] h-[18px]"
                      checked={marketingAgreed}
                      onCheckedChange={(checked) => setMarketingAgreed(checked === true)}
                    />
                    마케팅 및 광고 수신 동의
                  </div>
                  <Button type="button" variant="link" className="!p-0 gap-1">
                    <p className="text-xs">자세히 보기</p>
                    <ChevronRight className="mt-[2px]" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon">
                  <ArrowLeft />
                </Button>
                <Button
                  disabled={!form.formState.isValid || signUp.isPending}
                  type="submit"
                  variant="outline"
                  className="flex-1 !bg-sky-800/50"
                >
                  {signUp.isPending && <Loader2 className="size-4 animate-spin" />}
                  회원가입
                </Button>
              </div>

              <div className="text-center">
                이미 계정이 있으신가요?
                <NavLink to="/sign-in" className="underline ml-1">
                  로그인
                </NavLink>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
