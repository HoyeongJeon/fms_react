import { useState } from 'react';
import DaumPostcode from 'react-daum-postcode';

const AddressInput = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleAddress = (data: any) => {
        // 여기서 주소 처리
        setIsPopupOpen(false); // 팝업 닫기
    };

    return (
        <div>
            <button onClick={() => setIsPopupOpen(true)}>주소 검색</button>
            {isPopupOpen && (
                <DaumPostcode
                    onComplete={handleAddress}
                    /* 필요한 경우 다른 props 추가 */
                />
            )}
        </div>
    );
};

export default AddressInput;

//스타일드 컴포넌트
