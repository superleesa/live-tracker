import { useState } from "react";
import styles from "./page.module.css";


type SelecteeBoxProps = {
    name: string;
    onClick?: () => void;
};

export function SelectableBox({ name, onClick = () => {} }: SelecteeBoxProps) {
    const [isSelected, setIsSelected] = useState(false);

    return (
        <div className={`${styles.selectee_box} ${isSelected ? styles.selected : ''}`} onClick={() => {setIsSelected(!isSelected); onClick();}}>
            {name}
        </div>
    );
}