import React from "react";
import styles from "../Styles/AnimatedIcons.module.css";
import { Instagram, Linkedin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";

const AnimatedIcons = () => {
    return (
        <div className={`${styles.container} h-50`}>

            <div className={styles.center}></div>

            <div className={styles.orbit} id={styles.firstOrbit}>
                <div className={styles.iconsContainer} id={styles.wpContainer}>
                    <FaWhatsapp color="#FFFFFF" size={35} />
                </div>
            </div>

            <div className={styles.orbit} id={styles.secondOrbit}>
                <div className={styles.iconsContainer} id={styles.instaContainer}>
                    <Instagram color="#FFFFFF" size={35} />
                </div>
            </div>

            <div className={styles.orbit} id={styles.thirdOrbit}>
                <div className={styles.iconsContainer} id={styles.linkedInContainer}>
                    <Linkedin color="#FFFFFF" size={35} />
                </div>
                <div className={styles.iconsContainer} id={styles.mailContainer}>
                    <IoMdMail color="#FFFFFF" size={35} />
                </div>
            </div>
        </div>
    );
}
export default AnimatedIcons