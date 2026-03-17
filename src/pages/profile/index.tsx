import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Camera, CircleUser, Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { Button, Field, FieldError, FieldGroup, FieldLabel, Input } from "@/components/ui";
import { useAuthStore } from "@/stores";
import { useUser } from "@/hooks";
import { userApi } from "@/api";
import { useImageUpload } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import supabase from "@/lib/supabase";

/* ─────────────── Schemas ─────────────── */
const profileSchema = z.object({
  nickname: z.string().min(1, { message: "닉네임을 입력해주세요." }),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "현재 비밀번호를 입력해주세요." }),
    newPassword: z.string().min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." }),
    confirmPassword: z.string().min(1, { message: "비밀번호 확인을 입력해주세요." }),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({ code: "custom", message: "비밀번호가 일치하지 않습니다.", path: ["confirmPassword"] });
    }
  });

const deleteSchema = z.object({
  confirmText: z.string().min(1, { message: "확인 문구를 입력해주세요." }),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type DeleteForm = z.infer<typeof deleteSchema>;

/* ─────────────── Eye Toggle Helper ─────────────── */
function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition"
      onClick={toggle}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

/* ─────────────── Main Component ─────────────── */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, reset } = useAuthStore();
  const { userInfo } = useUser();
  const { upload } = useImageUpload();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nickname: "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const deleteForm = useForm<DeleteForm>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { confirmText: "" },
  });

  useEffect(() => {
    if (userInfo) {
      profileForm.reset({ nickname: userInfo.nickname ?? "" });
      setImagePreview(userInfo.profile_image ?? null);
    }
  }, [userInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const provider = data.session?.user?.app_metadata?.provider;
      setIsOAuthUser(provider === "google");
    });
  }, []);

  if (!user?.id) {
    navigate("/sign-in");
    return null;
  }

  /* ── Handlers ── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const onProfileSubmit = async (values: ProfileForm) => {
    try {
      let imageUrl = userInfo?.profile_image ?? null;
      if (imageFile) {
        const uploaded = await upload.mutateAsync(imageFile);
        if (uploaded) imageUrl = uploaded;
      }
      await userApi.updateUserInfo(user.id, { nickname: values.nickname, profile_image: imageUrl });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.info(user.id).queryKey });
      toast.success("프로필이 저장되었습니다.");
    } catch {
      toast.error("프로필 저장에 실패했습니다.");
    }
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      });
      if (signInErr) {
        passwordForm.setError("currentPassword", { message: "현재 비밀번호가 올바르지 않습니다." });
        return;
      }
      const { error: updateErr } = await supabase.auth.updateUser({ password: values.newPassword });
      if (updateErr) throw updateErr;
      toast.success("비밀번호가 변경되었습니다.");
      passwordForm.reset();
    } catch {
      toast.error("비밀번호 변경에 실패했습니다.");
    }
  };

  const expectedDeleteText = `${user.email} 탈퇴 하는데 동의 합니다.`;

  const onDeleteSubmit = async (values: DeleteForm) => {
    if (values.confirmText !== expectedDeleteText) {
      deleteForm.setError("confirmText", { message: "확인 문구가 일치하지 않습니다." });
      return;
    }
    try {
      await userApi.deleteUserData(user.id);
      await reset();
      toast.success("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    } catch {
      toast.error("회원 탈퇴에 실패했습니다.");
    }
  };

  /* ─────────────── Edit Forms ─────────────── */
  return (
    <main className="w-full min-h-screen flex justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg flex flex-col gap-6 py-4">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-foreground/5 text-foreground/60 transition hover:bg-foreground/10 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="text-xl font-semibold">프로필 설정</h2>
        </div>

        {/* 기본 정보 */}
        <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-semibold text-foreground">기본 정보</h3>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full border-2 border-border bg-foreground/8 flex items-center justify-center">
                    <CircleUser className="h-12 w-12 text-foreground/40" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full border border-border bg-background flex items-center justify-center text-foreground/60 hover:text-foreground transition shadow-sm"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <FieldGroup className="gap-4">
              <Controller
                name="nickname"
                control={profileForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>닉네임</FieldLabel>
                    <Input placeholder="닉네임을 입력해주세요." {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </FieldGroup>

            <Button type="submit" disabled={profileForm.formState.isSubmitting} className="w-full">
              {profileForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "저장"}
            </Button>
          </form>
        </section>

        {/* 비밀번호 변경 - 구글 계정은 숨김 */}
        {!isOAuthUser && (
          <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground">비밀번호 변경</h3>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
              <FieldGroup className="gap-4">
                <Controller
                  name="currentPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>현재 비밀번호</FieldLabel>
                      <div className="relative">
                        <Input type={showCurrentPw ? "text" : "password"} placeholder="현재 비밀번호" {...field} />
                        <EyeBtn show={showCurrentPw} toggle={() => setShowCurrentPw(!showCurrentPw)} />
                      </div>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
                <Controller
                  name="newPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>새 비밀번호</FieldLabel>
                      <div className="relative">
                        <Input type={showNewPw ? "text" : "password"} placeholder="새 비밀번호 (8자 이상)" {...field} />
                        <EyeBtn show={showNewPw} toggle={() => setShowNewPw(!showNewPw)} />
                      </div>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={passwordForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>새 비밀번호 확인</FieldLabel>
                      <div className="relative">
                        <Input type={showConfirmPw ? "text" : "password"} placeholder="새 비밀번호 확인" {...field} />
                        <EyeBtn show={showConfirmPw} toggle={() => setShowConfirmPw(!showConfirmPw)} />
                      </div>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </FieldGroup>
              <Button type="submit" disabled={passwordForm.formState.isSubmitting} className="w-full">
                {passwordForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "비밀번호 변경"}
              </Button>
            </form>
          </section>
        )}

        {/* 구글 계정 회원 탈퇴 */}
        {isOAuthUser && (
          <section className="flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <h3 className="font-semibold text-destructive">위험 구역</h3>
            </div>

            <div className="rounded-xl border border-destructive/20 bg-destructive/8 p-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-destructive">⚠️ 회원 탈퇴 시 다음 데이터가 영구 삭제됩니다</p>
              <ul className="text-sm text-destructive/80 space-y-1 list-none pl-1">
                <li>• 작성한 모든 글 및 임시저장 글</li>
                <li>• 모든 대화 내용 (DM)</li>
                <li>• 프로필 정보 및 계정</li>
              </ul>
              <p className="text-xs text-destructive/70 mt-1 font-medium">이 작업은 절대 되돌릴 수 없습니다.</p>
            </div>

            {!deleteOpen ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive transition hover:bg-destructive/20 w-fit"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                회원 탈퇴
              </button>
            ) : (
              <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-muted-foreground">아래 문구를 정확히 입력하여 탈퇴를 확인해주세요.</p>
                  <div className="rounded-lg border border-border bg-foreground/5 px-4 py-3 select-all">
                    <p className="text-sm font-mono font-medium text-foreground break-all">{expectedDeleteText}</p>
                  </div>
                </div>
                <Controller
                  name="confirmText"
                  control={deleteForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>확인 문구 입력</FieldLabel>
                      <Input placeholder="위 문구를 정확히 입력하세요" {...field} />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-border bg-foreground/5 px-4 py-2.5 text-sm text-foreground/70 transition hover:bg-foreground/10"
                    onClick={() => {
                      setDeleteOpen(false);
                      deleteForm.reset();
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={deleteForm.formState.isSubmitting}
                    className="flex-1 rounded-lg border border-destructive/30 bg-destructive/15 px-4 py-2.5 text-sm text-destructive transition hover:bg-destructive/25 disabled:opacity-50 font-medium"
                  >
                    {deleteForm.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      "탈퇴 확인"
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* 위험 구역 / 회원 탈퇴 - 구글 계정은 숨김 */}
        {!isOAuthUser && (
          <section className="flex flex-col gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <h3 className="font-semibold text-destructive">위험 구역</h3>
            </div>

            {/* 경고 박스 */}
            <div className="rounded-xl border border-destructive/20 bg-destructive/8 p-4 flex flex-col gap-2">
              <p className="text-sm font-semibold text-destructive">⚠️ 회원 탈퇴 시 다음 데이터가 영구 삭제됩니다</p>
              <ul className="text-sm text-destructive/80 space-y-1 list-none pl-1">
                <li>• 작성한 모든 글 및 임시저장 글</li>
                <li>• 모든 대화 내용 (DM)</li>
                <li>• 프로필 정보 및 계정</li>
              </ul>
              <p className="text-xs text-destructive/70 mt-1 font-medium">이 작업은 절대 되돌릴 수 없습니다.</p>
            </div>

            {!deleteOpen ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive transition hover:bg-destructive/20 w-fit"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                회원 탈퇴
              </button>
            ) : (
              <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-muted-foreground">아래 문구를 정확히 입력하여 탈퇴를 확인해주세요.</p>
                  <div className="rounded-lg border border-border bg-foreground/5 px-4 py-3 select-all">
                    <p className="text-sm font-mono font-medium text-foreground break-all">{expectedDeleteText}</p>
                  </div>
                </div>

                <Controller
                  name="confirmText"
                  control={deleteForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>확인 문구 입력</FieldLabel>
                      <Input placeholder="위 문구를 정확히 입력하세요" {...field} />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-border bg-foreground/5 px-4 py-2.5 text-sm text-foreground/70 transition hover:bg-foreground/10"
                    onClick={() => {
                      setDeleteOpen(false);
                      deleteForm.reset();
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={deleteForm.formState.isSubmitting}
                    className="flex-1 rounded-lg border border-destructive/30 bg-destructive/15 px-4 py-2.5 text-sm text-destructive transition hover:bg-destructive/25 disabled:opacity-50 font-medium"
                  >
                    {deleteForm.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      "탈퇴 확인"
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
