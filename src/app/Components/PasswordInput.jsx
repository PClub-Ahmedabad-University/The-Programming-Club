import React, { useState } from "react";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";

export default function PasswordInput(inputProps) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="flex flex-row gap-2">
			<input type={visible ? "text" : "password"} {...inputProps} />
			<button
				className="p-4 bg-[#131836]"
				type="button"
				onClick={() => setVisible((prev) => !prev)}
			>
				{visible ? <IoEyeOffSharp color="white" /> : <IoEyeSharp color="white" />}
			</button>
		</div>
	);
}
