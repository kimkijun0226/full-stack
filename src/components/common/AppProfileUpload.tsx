import { useRef } from "react";
import { Button, Input } from "../ui";
import { Image } from "lucide-react";

interface AppFileUploadProps {
  file: File | string | null;
  setFile: (file: File | string | null) => void;
}

export function AppProfileUpload({ file, setFile }: AppFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
    // 동일 타겟 초기화
    e.target.value = "";
  };

  //   이미지 미리보기
  const handleRenderPreview = () => {
    if (typeof file === "string") {
      return <img src={file} alt="thumbnail" className="w-full aspect-video rounded-lg object-cover border" />;
    } else if (file instanceof File) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="thumbnail"
          className="w-full aspect-video rounded-lg object-cover border"
        />
      );
    }

    //  기본 이미지
    return (
      <div className="w-full flex items-center justify-center aspect-video bg-card rounded-lg">
        <Button
          type="button"
          size={"icon"}
          variant={"ghost"}
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-full"
        >
          <Image />
        </Button>
      </div>
    );
  };

  return (
    <>
      {handleRenderPreview()}
      <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </>
  );
}
