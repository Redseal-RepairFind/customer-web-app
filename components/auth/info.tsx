"use client";

import {
  accountType,
  businessAcctType,
  countries,
  icons,
  residentialAcctType,
} from "@/lib/constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Text from "../ui/text";
import { InputContainer } from "./signup-item";
import Image from "next/image";
import Dropdown from "../ui/dropdown";
import { useCallback, useEffect, useState } from "react";
import Button from "../ui/custom-btn";
import AuthQuestion from "./question";
import PlacesAutocomplete from "../ui/places-autocomplete";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import HoverTooltip from "../ui/tool-tip";
import { CgCheck } from "react-icons/cg";
import { useAuth } from "@/hook/useAuth";
import { countriesPhoneCodes } from "@/lib/countries";

import { SignupValues } from "@/lib/signup-schema";
import LoadingTemplate from "../ui/spinner";
import Link from "next/link";

const UserInformation = () => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const field = params.get("type");

  const [dropdown, setDropdown] = useState<any>();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState({
    pass: false,
    confirm: false,
  });
  const initPlan = accountType?.find((acct) => acct.id === field);
  const [selectedPlan, setselectedPlan] = useState(initPlan);
  const [selectedPredictions, setSelectedPredictions] = useState<any>("");

  const predictions = selectedPredictions?.prediction;

  // console.log(extraInfo);

  const {
    handleSignup,
    isLoading,
    register,
    handleSubmit,
    setExtraInfo,
    handleSetExtraInfo,
    errors,
    setValue,
    initCnt,
    extraError,
  } = useAuth();

  const [selectCnt, setSelectCnt] = useState({
    selected: initCnt,
    countriesToMap: countriesPhoneCodes,
  });

  // console.log(selectedPredictions);

  useEffect(() => {
    setExtraInfo((ext) => ({
      ...ext,
      coverageAddress: {
        latitude: predictions?.latitude || "",
        longitude: predictions?.longitude || "",
        address: predictions?.address || "",
        city: predictions?.city || "",
        country: predictions?.address || "",
        state: predictions?.region || "",
      },
    }));

    handleSetExtraInfo("acceptTerms", acceptTerms);
  }, [selectedPredictions, acceptTerms]);

  // console.log(extraI);

  const fieldsInput = businessAcctType;
  // const fieldsInput = field?.toUpperCase()?.includes("RESIDENTIAL")
  //   ? residentialAcctType
  //   : businessAcctType;

  const setQueryParam = useCallback(
    (key: string, value?: string | null) => {
      const nextParams = new URLSearchParams(params.toString());
      if (!value) nextParams.delete(key);
      else nextParams.set(key, value);

      const nextUrl = `${pathname}${nextParams.size ? `?${nextParams}` : ""}`;
      const currentUrl = `${pathname}${params.size ? `?${params}` : ""}`;

      if (nextUrl !== currentUrl) router.replace(nextUrl, { scroll: false });
    },
    [pathname, params, router]
  );

  useEffect(() => {
    setQueryParam("type", selectedPlan?.id ?? null);
  }, [selectedPlan?.id, setQueryParam]);

  const handleTogglePwd = (id: "pass" | "confirm") => {
    setShowPassword((pass) => ({
      ...pass,
      [id]: !pass[id],
    }));
  };

  return (
    <form
      className="flex-col md:px-5 gap-10 w-full"
      onSubmit={handleSubmit(handleSignup as any)}
    >
      <Text.Heading className="mb-5">
        Create a RepairFinder account
      </Text.Heading>

      {fieldsInput.map((inps) =>
        inps.type === "input" ? (
          <div className="flex-col gap-4 mb-4" key={inps.id}>
            <div className="flex-rows mb-2">
              <Text.Paragraph className="font-semibold mr-2">
                {inps.title}
              </Text.Paragraph>
              {inps.notice ? (
                <HoverTooltip content="Providing false information about your equipment’s age will void your RepairFind subscription.">
                  <button type="button" className="h-4 w-4 relative">
                    <Image src={icons.infoIcon} alt="Info icon" fill />
                  </button>
                </HoverTooltip>
              ) : null}
            </div>

            <div className="flex flex-rows gap-4">
              {inps.id === "number" ? (
                <div className=" min-w-20 h-12 border border-light-10 rounded-lg">
                  <Dropdown className="w-full">
                    <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
                      <Text.Paragraph className="text-dark-500">
                        {selectCnt?.selected?.flag}
                      </Text.Paragraph>
                    </Dropdown.Trigger>
                    <Dropdown.Content className="w-[200px] bg-white">
                      <input
                        className="input-container text-xs"
                        placeholder="Search country name or code"
                        onChange={(e) => {
                          const text = e.target.value;
                          const newCnt = countriesPhoneCodes.filter(
                            (itn) =>
                              itn.name.toLowerCase().includes(text) ||
                              itn.dial_code.toLowerCase().includes(text)
                          );
                          setSelectCnt((cnt) => ({
                            ...cnt,
                            countriesToMap: newCnt,
                          }));
                        }}
                      />
                      <Dropdown.Label>
                        <Text.Paragraph className="text-dark-500">
                          Select country
                        </Text.Paragraph>
                      </Dropdown.Label>

                      {selectCnt.countriesToMap.length ? (
                        selectCnt.countriesToMap.map((cnt) => (
                          <Dropdown.Item
                            key={cnt.name}
                            onClick={() => {
                              setSelectCnt((st) => ({
                                ...st,
                                selected: cnt,
                              }));
                              handleSetExtraInfo("country", cnt);
                            }}
                          >
                            {`${cnt.flag} ${cnt.name} ${cnt.dial_code}`}
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item className="p-6">
                          No match found
                        </Dropdown.Item>
                      )}
                    </Dropdown.Content>
                  </Dropdown>
                </div>
              ) : null}

              <InputContainer>
                {inps.id === "number" ? (
                  <Text.Paragraph className="mr-2 text-dark-500">
                    {selectCnt.selected?.dial_code}
                  </Text.Paragraph>
                ) : null}
                <input
                  {...register(inps.id as keyof SignupValues)}
                  type={
                    inps.id === "password"
                      ? showPassword.pass
                        ? "text"
                        : "password"
                      : inps.id === "confirmPassword"
                      ? showPassword.confirm
                        ? "text"
                        : "password"
                      : inps.inputType === "number"
                      ? "tel"
                      : inps.inputType || "text"
                  }
                  className="text-input"
                  placeholder={inps.placeHolder}
                />

                {inps.icon ? (
                  <button
                    className="h-5 w-5 relative cursor-pointer"
                    onClick={() =>
                      inps.id.toLowerCase().includes("password")
                        ? handleTogglePwd(
                            inps.id === "password" ? "pass" : "confirm"
                          )
                        : () => {}
                    }
                    type="button"
                  >
                    {inps.id === "password" ? (
                      showPassword.pass ? (
                        <FaEye />
                      ) : (
                        <FaEyeSlash />
                      )
                    ) : inps.id === "confirmPassword" ? (
                      showPassword.confirm ? (
                        <FaEye />
                      ) : (
                        <FaEyeSlash />
                      )
                    ) : (
                      <Image src={inps.icon} fill alt="Icons" />
                    )}
                  </button>
                ) : null}
              </InputContainer>
            </div>

            {errors?.[inps.id as keyof SignupValues]?.message && (
              <Text.SmallText className="text-red-500">
                {String(errors[inps.id as keyof SignupValues]?.message)}
              </Text.SmallText>
            )}
            {inps.id === "businessName" && (
              <Text.SmallText className="text-red-500">
                {extraError.businessName}
              </Text.SmallText>
            )}
          </div>
        ) : (
          <div className="flex-col gap-4 mb-4" key={inps.id}>
            <div className="flex-rows mb-2">
              <Text.Paragraph className="font-semibold mr-2">
                {inps.title}
              </Text.Paragraph>

              {inps.notice ? (
                <HoverTooltip
                  content={
                    inps.id === "homeAddress"
                      ? "This is the address that will be linked to your subscription"
                      : inps.id === "number"
                      ? "Do not include country code"
                      : "Providing false information about your equipment’s age will void your RepairFind subscription."
                  }
                >
                  <button
                    type="button"
                    className="h-4 w-4 relative cursor-pointer"
                  >
                    <Image src={icons.infoIcon} alt="Info icon" fill />
                  </button>
                </HoverTooltip>
              ) : null}
            </div>
            {inps.id === "homeAddress" ? (
              <PlacesAutocomplete
                selectedPredictions={selectedPredictions}
                setSelectedPredictions={setSelectedPredictions}
                // modal
              />
            ) : (
              <Dropdown className="w-full">
                <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
                  <Text.Paragraph className="text-dark-500">
                    {inps.id === "acctType"
                      ? selectedPlan?.name
                      : dropdown?.name || "Select Equipment Age"}
                  </Text.Paragraph>
                </Dropdown.Trigger>
                <Dropdown.Content className="w-full bg-white">
                  <Dropdown.Label>
                    <Text.Paragraph className="text-dark-500">
                      Select
                    </Text.Paragraph>
                  </Dropdown.Label>
                  {inps?.list.map((cnt, i) => (
                    <Dropdown.Item
                      key={cnt.name}
                      className={` ${
                        i === countries?.length - 1
                          ? ""
                          : "border-b border-b-light-100"
                      } `}
                      onClick={() => {
                        const isAcctType = inps.id === "acctType";

                        // set the extra info key once
                        handleSetExtraInfo(
                          isAcctType
                            ? "subscriptionType"
                            : "equipmentAgeCategory",
                          cnt?.id
                        );

                        setValue(isAcctType ? "acctType" : "eqAge", cnt.id, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });

                        // do the right state update
                        if (isAcctType) {
                          setselectedPlan(cnt); // cnt should match your plan type
                        } else {
                          setDropdown(cnt); // cnt should match your dropdown item type
                        }
                      }}
                    >
                      <Text.Paragraph className="text-dark-500">
                        {cnt.name}
                      </Text.Paragraph>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Content>
              </Dropdown>
            )}
          </div>
        )
      )}

      <div className="flex-rows gap-2">
        <button
          className={`h-4 w-4 rounded-sm border border-dark-300 ${
            acceptTerms ? "bg-dark" : ""
          } flex-row-center cursor-pointer`}
          onClick={() => {
            setAcceptTerms((acc) => !acc);
            // setExtraInfo(ext=)
          }}
          type="button"
        >
          {acceptTerms ? <CgCheck color="#ffffff" /> : null}
        </button>

        <Text.Paragraph className="text-sm lg:text-base">
          By creating an account, you agree to our{" "}
          <Link
            href={"/terms"}
            className="underline font-semibold cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href={"/policy"}
            className="underline font-semibold cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
        </Text.Paragraph>
      </div>

      <Button
        className="cursor-pointer w-full mb-4 mt-8 min-h-12 relative"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? (
          <LoadingTemplate isMessage={false} variant="small" />
        ) : (
          <Button.Text>Create Account</Button.Text>
        )}
      </Button>

      <div className="">
        <AuthQuestion link="/login" linkTxt="Log in" text="Have an account?" />
      </div>
    </form>
  );
};

export default UserInformation;
