import React from "react";
import styles from "../Styles/AnimatedIcons.module.css";
import { Instagram, Linkedin } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";

const AnimatedIcons = () => {
    return (
        <div className={styles.container}>
            <div className={styles.center}></div>

            <div className={styles.orbit} id={styles.firstOrbit}>
                <div className={styles.iconsContainer} id={styles.wpContainer}>
                    <a
                      href="https://discord.gg/dkftG9JWtt"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                        <FaDiscord color="#FFFFFF" className={styles.icon} />
                    </a>
                </div>
            </div>

            <div className={styles.orbit} id={styles.secondOrbit}>
                <div className={styles.iconsContainer} id={styles.instaContainer}>
                    <a
                      href="instagram.com/ahduni_programmingclub/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                        <Instagram color="#FFFFFF" className={styles.icon} />
                    </a>
                </div>
            </div>

            <div className={styles.orbit} id={styles.thirdOrbit}>
                <div className={styles.iconsContainer} id={styles.linkedInContainer}>
                    <a
                      href="https://www.linkedin.com/company/programming-club-ahmedabad-university"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                        <Linkedin color="#FFFFFF" className={styles.icon} />
                    </a>
                </div>
                <div className={styles.iconsContainer} id={styles.mailContainer}>
                    <a href="mailto:programming.club@ahduni.edu.in">
                        <IoMdMail color="#FFFFFF" className={styles.icon} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AnimatedIcons