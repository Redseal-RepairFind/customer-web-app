"use client";

import Image from "next/image";
import Text from "../ui/text";
import { slideImages } from "@/lib/dasboard-constatns";
import { useEffect, useRef, useState } from "react";
import Button from "../ui/custom-btn";
import { icons, images } from "@/lib/constants";
import { useUser } from "@/hook/useMe";
import LoadingTemplate from "../ui/spinner";
import Modal from "../ui/customModal";
import RequestModal from "./repair-requests/request-modal";
import { useToast } from "@/contexts/toast-contexts";
import RequestSubmitToast from "./home/request-submit-toast";
import { useSubCalc } from "@/hook/useSubCalc";
import { useSkills } from "@/hook/useSkills";
import { usePricing } from "@/hook/usePricing";
import { usePageNavigator } from "@/hook/navigator";
import { BiCheck, BiPlus } from "react-icons/bi";
import { SUB_EXTRA_ID } from "@/utils/types";
import { useSocket } from "@/contexts/socket-contexts";
import { useCopyToClipboard } from "@/hook/useCopy";
import { BsCopy } from "react-icons/bs";
import { CgCheck } from "react-icons/cg";

const ROTATE_MS = 4000; // auto-advance every 4s

const DashboardHeader = () => {
  const { curUser, loadingCurUser } = useUser();
  const [openModal, setOpenModal] = useState(false);
  const user = curUser?.data;
  const { warning, error } = useToast();
  const { daysLeft } = useSubCalc(user?.subscription);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slideImages?.length ?? 0;
  const { request_subscriptions, isLoadingRequestSub } = usePricing();

  const { skills, loadingSkills } = useSkills();
  const { curPathname, navigator } = usePageNavigator();

  const { isCopied, copy } = useCopyToClipboard();

  console.log(request_subscriptions);

  const allSkils = skills?.data || [];

  const isSubsPage = curPathname.includes("manage-subscription");

  // console.log(request_subscriptions);

  const handleCloseModal = () => setOpenModal(false);
  const handleOpenModal = () => {
    if (isSubsPage) {
      const extraSub = "new_sub";
      navigator?.navigate(`/pricing?new=${extraSub}`, "push");
      sessionStorage.setItem(SUB_EXTRA_ID, extraSub);
      return;
    }

    const planType = user?.subscriptions?.find((user: any) =>
      user?.status?.toLowerCase()?.includes("active")
    );

    // setOpenModal(true);

    if (daysLeft > 0)
      warning({
        render: (api) => <RequestSubmitToast subscription={planType} />,
        vars: { bg: "#FF2D55", fg: "#ffffff" }, // still can theme even with custom render
      });
    else {
      setOpenModal(true);
    }
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const start = () => {
    stop();
    if (total > 1) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % total);
      }, ROTATE_MS);
    }
  };

  // console.log(user);

  useEffect(() => {
    start();
    return stop;
  }, [total]);

  if (loadingCurUser || loadingSkills || isLoadingRequestSub)
    return <LoadingTemplate />;

  if (!total) {
    return (
      <div className="flex flex-col gap-5 w-full">
        <Text.Paragraph className="font-semibold text-sm md:text-base capitalize">
          Welcome back,{" "}
          {user?.businessName?.toLowerCase() || user?.firstName?.toLowerCase()}
        </Text.Paragraph>
        <div className="relative w-full h-[120px] rounded-lg bg-light-300 animate-pulse" />
      </div>
    );
  }

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  return (
    <>
      <Modal isOpen={openModal} onClose={handleCloseModal}>
        <RequestModal
          skillsList={allSkils}
          subsList={request_subscriptions}
          closeModal={handleCloseModal}
        />
      </Modal>
      <div className="flex flex-col gap-5 w-full">
        <div className="flex-cols  gap-2">
          <Text.SubHeading className="font-semibold capitalize">
            Welcome back,{" "}
            {user?.businessName?.toLowerCase() ||
              user?.firstName?.toLowerCase()}
          </Text.SubHeading>
          <div className=" gap-3">
            <Text.Paragraph className=" capitalize text-sm">
              Account ID:
            </Text.Paragraph>

            {user?.accountId && (
              <div className="flex-rows items-center gap-2">
                <span className="uppercase text-sm font-semibold">
                  {user?.accountId}
                </span>
                <button
                  className="cursor-pointer "
                  onClick={() => copy(user?.accountId)}
                >
                  {isCopied ? (
                    <div className="border border-light-0 p-[2px] rounded-sm flex items-center">
                      <BiCheck />
                      <p>copied</p>
                    </div>
                  ) : (
                    <BsCopy />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        <section
          className="relative w-full rounded-lg overflow-hidden shadow-sm"
          aria-roledescription="carousel"
          aria-label="Dashboard highlights"
          onMouseEnter={stop}
          onMouseLeave={start}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
          }}
        >
          <div className="relative w-full  min-h-[120px]">
            {/* {slideImages.map((src, i) => ( */}
            <Image
              // key={i}
              src={slideImages[2]}
              alt={`Header image`}
              fill
              // priority={i === 0}
              loading={"lazy"}
              className={`absolute inset-0 object-cover transition-opacity duration-700  `}
              sizes="100vw"
            />
            {/* ))}${i === index ? "opacity-100" : "opacity-0"} */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
          </div>

          <div className="absolute inset-0 ">
            <div className="flex-row-between gap-2 h-full md:px-4 px-2 py-2">
              <div className="py-2">
                <Text.Paragraph className="text-light-main font-semibold text-sm md:text-base leading-tight">
                  Get your repair requests handled by trusted contractors
                </Text.Paragraph>

                <Text.SmallText className="text-dark-100 text-xs md:text-sm leading-tight">
                  Submit detailed repair requests and track progress from start
                  to finish
                </Text.SmallText>
              </div>

              <Button variant="tertiary" onClick={handleOpenModal}>
                <Button.Icon className="h-4 w-4 relative">
                  {isSubsPage ? (
                    <BiPlus size={16} className="font-black" />
                  ) : (
                    <Image
                      src={icons.requestIconActive}
                      fill
                      alt="button icon"
                    />
                  )}
                </Button.Icon>
                <Button.Text className="text-xs md:text-sm">
                  {isSubsPage ? "Add New Location" : " Submit a request"}
                </Button.Text>
              </Button>
            </div>
          </div>

          {/* <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
          {slideImages.map((_, i) => (
            <button
              key={`dot-${i}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-white ${
                i === index
                  ? "bg-white scale-110"
                  : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div> */}
        </section>
      </div>
    </>
  );
};

export default DashboardHeader;
