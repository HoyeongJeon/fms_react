import { useState } from "react";
import "./file-uploader.css";

interface FileUploaderType {
  descLabel: string;
  changedFunc: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader = (props: FileUploaderType) => {
  const [imageSrc, setImageSrc]: any = useState(null);

  const onUpload = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);

    return new Promise<void>((resolve) => {
      reader.onload = () => {
        setImageSrc(reader.result || null);
        props.changedFunc(e);
        resolve();
      };
    });
  };

  return (
    <div className="image-wrapper">
      <div className="image-viewer">
        <img src={imageSrc} alt="" width={"100%"} />
      </div>
      <label className="singup-logoImg-label" htmlFor="logoImage">
        {props.descLabel}
      </label>
      <input
        className="singup-logoImg-input "
        name=""
        id="logoImage"
        accept="image/*"
        multiple
        type="file"
        onChange={(e) => onUpload(e)}
      />
    </div>
  );
};

export default FileUploader;
