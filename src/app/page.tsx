"use client";
import { BaseInput } from "@/components/ui/forms/BaseInput";
import { z } from "zod";
import { Form } from "@/components/ui/forms/Form";
import { useForm } from "@/lib/hooks/useForm";
import { useRouter } from "next/navigation";
import { login } from "../services/auth";
import { useToast } from "@/contexts/toast.context";
import { useData } from "@/contexts/data.context";
import { useState } from "react";
import { Spinner } from "@/components/ui/loader/spinner";
// import { User } from "@/context/data.context";
export default function Home() {
  const authSchema = z.object({
    email: z.string(),
    password: z.string(),
  });
  const form = useForm({ schema: authSchema });
  const Router = useRouter();
  const { showToast } = useToast();
  const { dispatchUser } = useData();

  const [loading, setLoading] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  const onSubmit = async (data: z.infer<typeof authSchema>) => {
    let { email, password } = data;
    email = email.trim();
    password = password.trim();
    setLoading(true);
    if (email.length > 0 && password.length > 0) {
      const { success, data } = await login({ email, password });
      if (success) {

        setConnected(true);
        dispatchUser(data);
        showToast({
          message: "Connecté",
          type: "success",
          position: "top-center",
        });
        Router.push("/workspace/home");
      } else {
        showToast({
          message:
            "Echec de l'authentification vérifier vos cordonneés oubien la connexion internet",
          type: "danger",
          position: "top-center",
        });
        setLoading(false);
      }
    }
    // setLoading(false)
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[420px] bg-white rounded-xl px-[20px] py-[40px]">
        <h1 className="text-[26px] text-center text-[#060606] mb-[10px] font-medium font-poppins">
          Connectez vous
        </h1>
        <Form form={form} onSubmit={onSubmit}>
          <div className="w-full flex flex-col gap-y-[10px]">
            <BaseInput
              label="Email"
              id="email"
              placeholder="Email"
              leftIcon={
                <svg
                  id="fi_6719191"
                  height="25"
                  viewBox="0 0 64 64"
                  width="25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#888888"
                    d="m60.4082 29.69141c-1.88084-23.98363-31.63769-34.96541-48.56113-17.84335-22.32489 23.22029 3.67828 59.4168 32.82212 45.68841a1.5003 1.5003 0 0 0 -1.33624-2.68635c-26.08095 12.27888-49.3391-20.10449-29.36395-40.88152 15.14586-15.30906 41.76271-5.50609 43.4489 15.959a25.54 25.54 0 0 1 -2.89833 14.048 4.69648 4.69648 0 0 1 -7.40918 1.01406 5.46731 5.46731 0 0 1 -1.61039-3.88907v-21.10059a1.50016 1.50016 0 0 0 -3 .00007v3.53326c-7.84015-9.81018-23.9884-4.25417-23.99993 8.46689.01534 12.72183 16.15693 18.2774 24 8.46623-.426 4.96174 4.02981 9.71067 9.10652 8.824 7.38883-.86991 9.3132-13.53582 8.80161-19.59904zm-28.4082 12.80859a10.51211 10.51211 0 0 1 -10.5-10.5c.577-13.92969 20.42543-13.92561 21 .00008a10.51181 10.51181 0 0 1 -10.5 10.49992z"
                  ></path>
                </svg>
              }
              type="email"
              {...form.register("email")}
            />
            <BaseInput
              label="Mot de passe"
              id="password"
              placeholder="Mot de passe"
              leftIcon={
                <svg
                  id="fi_4520142"
                  enableBackground="new 0 0 32 32"
                  height="25"
                  viewBox="0 0 32 32"
                  width="25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <path
                      fill="#888888"
                      d="m22.029 11.078v-2.293c0-3.325-2.705-6.029-6.029-6.029s-6.029 2.704-6.029 6.029v.001.001l.006 2.291c-2.31.279-4.113 2.229-4.113 4.613v8.884c0 2.575 2.095 4.669 4.669 4.669h10.934c2.575 0 4.669-2.095 4.669-4.669v-8.884c0-2.382-1.799-4.331-4.107-4.613zm-6.029-7.285c2.752 0 4.992 2.239 4.992 4.992v2.236h-9.978l-.006-2.236c0-2.752 2.24-4.992 4.992-4.992zm9.099 20.782c0 2.002-1.629 3.632-3.632 3.632h-10.934c-2.002 0-3.632-1.629-3.632-3.632v-8.884c0-2.002 1.629-3.632 3.632-3.632h10.934c2.002 0 3.632 1.629 3.632 3.632z"
                    ></path>
                  </g>
                  <g>
                    <path
                      fill="#888888"
                      d="m18.948 17.781c0-.892-.398-1.727-1.091-2.29-.694-.563-1.604-.777-2.491-.591-1.068.224-1.96 1.082-2.221 2.135-.29 1.167.125 2.354 1.041 3.067l-.839 3.493c-.082.341-.005.695.213.971.217.276.544.434.895.434h3.091c.352 0 .678-.159.896-.435.217-.276.294-.63.212-.97l-.839-3.494c.706-.554 1.133-1.412 1.133-2.32zm-2.227 2.253.922 3.842c-.04.051-.058.073-.098.125h-3.091l-.098-.125.922-3.842c.051-.211-.025-.446-.214-.552-.773-.437-1.139-1.334-.9-2.208.188-.685.795-1.217 1.496-1.336.116-.02.231-.03.344-.03.438 0 .853.146 1.199.427.449.365.707.906.707 1.484 0 .679-.369 1.315-.96 1.655-.193.111-.281.343-.229.56z"
                    ></path>
                  </g>
                </svg>
              }
              type="password"
              {...form.register("password")}
            />
          </div>

          <div className="w-full flex justify-center mt-[20px]">
            <button
              disabled={loading}
              type="submit"
              className={`w-full h-[48px] text-white transition-all font-poppins px-[16px] flex items-center gap-x-2 justify-center border rounded-xl bg-[#060606] hover:bg-[#060606]/90`}
            >
              {loading && !connected ? (
                <>
                  <Spinner color={"#fff"} size={20} />
                  {"Connexion en cours"}
                </>
              ) : loading && connected ? (
                <>
                  <Spinner color={"#fff"} size={20} />
                  {"Redirection"}
                </>
              ) : (
                "Connexion"
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
