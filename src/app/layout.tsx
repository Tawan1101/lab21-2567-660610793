"use client";

import { $authenStore } from "@lib/authenStore";
import { Container, Group, Loader, Title } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Footer from "@components/Footer";
import axios from "axios";

import { Inter } from "next/font/google";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCheckingAuthen, setIsCheckingAuthen] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const checkAuthen = async () => {
    const token = localStorage.getItem("token");
    const authenUsername = localStorage.getItem("authenUsername");

    //check within localStorage
    let isTokenValid = true;
    if (!token || !authenUsername) {
      isTokenValid = false;
    } else {
      //check if token is still valid
      try {
        const resp = await axios.get("/api/user/checkAuthen", {
          headers: { Authorization: `Bearer ${token}` },
        });
        $authenStore.set({ token, authenUsername });
      } catch (err:any) {
        console.log(err.message);
        isTokenValid = false;
      }
    }

    //go to login if not logged in yet and trying to access protected route
    if (pathname !== "/" && !isTokenValid) {
      startTransition(() => {
        router.push("/");
      });

      //go to /student if already logged in
    } else if (pathname === "/" && isTokenValid) {
      startTransition(() => {
        router.push("/student");
      });
    }
    setIsCheckingAuthen(false);
  };

  useEffect(() => {
    // Check authen when component mounts or route changes
    checkAuthen();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider>
          {(isCheckingAuthen || isPending) && (
            <Group align="center">
              <Loader />
            </Group>
          )}
          {!isCheckingAuthen && !isPending && (
            <Container size="sm">
              <Title fs="italic" ta="center" c="violet" my="xs">
                Course Enrollment
              </Title>
              {children}
              <Footer
                studentId="660610793"
                fullName="wanchai lungnoeng"
                year="2024"
              />
            </Container>
          )}
        </MantineProvider>
      </body>
    </html>
  );
}