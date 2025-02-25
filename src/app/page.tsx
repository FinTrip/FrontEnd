import Link from "next/link";
import HomeSlider from "./page/components/home/HomeSlider";
import RegisterPage from "./page/auth/register/page";
import Plan from "./page/components/home/plan";

export default function Home() {
  return (
    <main>
      <HomeSlider />
      <RegisterPage />
      <div className="text-center my-4">
        <Link
          href="/plan"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Xem Kế Hoạch
        </Link>
      </div>
    </main>
  );
}
