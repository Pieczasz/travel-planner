import Image from 'next/image';
import Link from 'next/link';

// icons
import { MdOutlineAccountCircle } from 'react-icons/md';
import { HiOutlineViewList } from 'react-icons/hi';
import { FaRegFlag, FaRegHeart } from 'react-icons/fa';
import { FaEarthEurope } from 'react-icons/fa6';

const Nav = () => {
	return (
		<nav className="flex justify-between items-center">
			<div>
				<Link href="/">
					<Image
						src="/logo.svg"
						alt="logo"
						width={96}
						height={32}
						className="p-6"
					/>
				</Link>
			</div>
			<div className="flex gap-1 items-center p-6">
				<div className="divIcon">
					<FaEarthEurope className="icon" />
				</div>
				<div className="divIcon">
					<FaRegHeart className="icon" />
				</div>
				<div className="divIcon">
					<MdOutlineAccountCircle className="icon" />
				</div>
				<div className="divIcon">
					<HiOutlineViewList className="icon" />
				</div>
			</div>
		</nav>
	);
};

export default Nav;
