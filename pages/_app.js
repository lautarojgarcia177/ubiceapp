import "bootstrap/dist/css/bootstrap.min.css";
import "@aws-amplify/ui-react/styles.css";
import "@/styles/custom-theme.css"
import "@/styles/styles.css"
import 'react-toastify/dist/ReactToastify.css';

import { Amplify } from "aws-amplify";
import awsExports from "../aws-exports.js";
import { Montserrat } from "next/font/google";
import Layout from "@/components/Layout";

Amplify.configure({ ...awsExports, ssr: true });
const montserrat = Montserrat({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  return (
    <main className={montserrat.className}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </main>
  );
}
