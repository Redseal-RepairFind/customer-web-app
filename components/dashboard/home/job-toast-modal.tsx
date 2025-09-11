import Button from "@/components/ui/custom-btn";
import { Rating } from "@/components/ui/rating";
import Text from "@/components/ui/text";
import { icons } from "@/lib/constants";
import { issueType, nextAct, recommend } from "@/lib/dasboard-constatns";
import { formatDateProper } from "@/lib/helpers";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa6";
import { HiOutlineExclamation } from "react-icons/hi";

const CompletedToast = ({
  jobResponse,
  onOpenRating,
}: {
  jobResponse?: any;
  onOpenRating?: () => void;
}) => {
  return (
    <div className="flex-rows items-center gap-3 md:w-[600px] lg:w-[700px]">
      <div className="min-w-10 max-w-10 h-10 rounded-full bg-green-main flex-row-center">
        <BsCheckCircle color="#ffffff" size={20} />
      </div>

      <div className="flex-cols gap-2">
        <Text.SmallHeading className="text-green-400">
          1 Completed Jobs Awaiting Feedback
        </Text.SmallHeading>
        <Text.Paragraph>
          Help other customers by charing your experience with these completed
          services
        </Text.Paragraph>

        <div>
          <Button variant="secondary_2" onClick={onOpenRating}>
            <Button.Icon>
              <FaRegStar size={20} />
            </Button.Icon>
            <Button.Text>Review Electrical</Button.Text>
          </Button>
        </div>
      </div>
    </div>
  );
};

const JobCompletedModal = ({
  onReport,
  onReview,
  jobInfo,
  onClose,
}: {
  onReview: () => void;
  onReport: () => void;
  onClose: () => void;
  jobInfo: any;
}) => {
  return (
    <div className="w-full flex-cols items-center gap-3">
      <BsCheckCircle color="#28A745" size={36} />

      <Text.SmallHeading>Job Completed</Text.SmallHeading>
      <Text.SubParagraph className="text-dark-500 text-sm">
        Your electrical service in the living room has been marked as completed.
      </Text.SubParagraph>

      <SpecialBox className="flex-row-between px-4 py-2">
        <div className="flex-rows items-center gap-2">
          <div className="h-12 w-12 flex-rows items-center justify-center text-base font-semibold bg-red-100 rounded-full">
            {"MK"}
          </div>

          <div className="flex-cols gap-">
            <Text.SmallHeading>{jobInfo?.name}</Text.SmallHeading>
            <Text.Paragraph className="text-dark-500 text-sm">
              {jobInfo?.category}
            </Text.Paragraph>
            <Text.Paragraph className="text-dark-500 text-sm">
              {formatDateProper(jobInfo?.date)}
            </Text.Paragraph>
          </div>
        </div>

        <div className="flex-cols">
          <div className="flex-rows items-center gap-2">
            <Image src={icons.star} width={20} height={20} alt="Star icon" />
            <Text.Paragraph className="text-dark-500 text-sm">
              {jobInfo.ratings}
            </Text.Paragraph>
          </div>
          <Text.Paragraph className="text-dark-500 text-sm">
            {jobInfo.jobsCompleted} jobs
          </Text.Paragraph>
        </div>
      </SpecialBox>

      <SpecialBox className="px-4 py-2 flex-cols justify-center">
        <Text.SmallHeading>Work Summary</Text.SmallHeading>
        <Text.SubParagraph className="text-dark-500 text-sm">
          Installed new outlet and switch
        </Text.SubParagraph>
      </SpecialBox>
      <Text.SubParagraph className="text-dark-500 text-sm">
        How was your experience with this service{" "}
      </Text.SubParagraph>

      <Button variant="green" className="w-full" onClick={onReview}>
        <Button.Icon>
          <FaRegStar size={20} />
        </Button.Icon>
        <Button.Text>Leave a Review</Button.Text>
      </Button>
      <Button variant="danger" className="w-full" onClick={onReport}>
        <Button.Icon>
          <HiOutlineExclamation size={20} />
          {/* <TfiAlert /> */}
        </Button.Icon>
        <Button.Text>Report an issue</Button.Text>
      </Button>
      <Button variant="tertiary" className="w-full" onClick={onClose}>
        <Button.Text>I'll decide later</Button.Text>
      </Button>
    </div>
  );
};

const JobRatingModal = ({
  onReview,
  jobInfo,
  onClose,
}: {
  onReview: () => void;
  onClose: () => void;
  jobInfo: any;
}) => {
  const [rating, setRating] = useState(0);
  const [selected, setSelected] = useState(recommend[0]);
  // console.log(rating);
  return (
    <div className="w-full flex-cols items-center gap-3">
      <Text.SmallHeading>Rate Your Experience</Text.SmallHeading>
      <Text.SubParagraph className="text-dark-500 text-sm">
        Help other customers by sharing your feedback about Mike Johnson{" "}
      </Text.SubParagraph>
      <SpecialBox className="flex-cols justify-center p-4">
        <div className="flex-rows items-center gap-2">
          <div className="h-12 w-12 flex-rows items-center justify-center text-base font-semibold bg-red-100 rounded-full">
            {"MK"}
          </div>

          <div className="flex-cols gap-">
            <Text.SmallHeading>{jobInfo?.name}</Text.SmallHeading>
            <Text.Paragraph className="text-dark-500 text-sm">
              {jobInfo?.category}
            </Text.Paragraph>
          </div>
        </div>
      </SpecialBox>
      <Text.SmallHeading>Overall Rating</Text.SmallHeading>
      <Rating defaultValue={0} onChange={(rt) => setRating(rt)} />
      <div className="gap-2 w-full flex-cols">
        <Text.SmallText className="font-semibold text-sm">
          Tell us about your experience (optional)
        </Text.SmallText>
        <textarea
          rows={4}
          cols={4}
          className="text-input bg-purple-blue-50 w-full p-2"
          placeholder="Tell us about your experience (optional)"
        />
      </div>

      <div className="flex-cols items-start gap-2 justify-start w-full">
        <Text.SmallHeading className="text-base font-semibold text-start">
          Would yoy recommend this contractor?
        </Text.SmallHeading>
        {recommend.map((rec, i) => (
          <div className="flex-rows items-center gap-2 justify-start" key={i}>
            <button
              className={`h-5 w-5 rounded-full cursor-pointer ${
                selected === rec ? "border-6" : "border border-dark-500"
              }`}
              onClick={() => setSelected(rec)}
            ></button>

            <Text.SmallText
              className={`text-sm ${
                selected === rec ? "text-dark" : "text-dark-500"
              }`}
            >
              {rec}
            </Text.SmallText>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 items-center gap-2 w-full">
        <Button onClick={onReview}>
          <Button.Text>Submit Review</Button.Text>
        </Button>
        <Button variant="secondary" onClick={onClose}>
          <Button.Text>Back</Button.Text>
        </Button>
      </div>
    </div>
  );
};

const JobDisputeModal = ({
  onClose,
  onReport,
}: {
  onClose: () => void;
  onReport: () => void;
}) => {
  const [selected, setSelected] = useState(issueType[0]);
  return (
    <div className="w-full flex-cols items-center gap-3">
      <Text.SmallHeading>Report an Issue</Text.SmallHeading>
      <Text.SubParagraph className="text-dark-500 text-sm">
        We're sorry to hear you had an issue. Please provide details so we can
        help resolve this.
      </Text.SubParagraph>

      <div className="px-4 py-4 rounded-lg bg-red-50 w-full">
        <Text.SubHeading className="text-base font-semibold">
          Job #12345
        </Text.SubHeading>
        <Text.SubParagraph className="text-dark-500 text-xs">
          Electrical - Living Room - June 16 2024
        </Text.SubParagraph>
        <Text.SubParagraph className="text-dark-500 text-xs">
          Contractor : Sarah Williams{" "}
        </Text.SubParagraph>
      </div>

      <div className="flex-cols items-start gap-2 justify-start w-full">
        <Text.SmallHeading className="text-base font-semibold text-start">
          What was the issue?
        </Text.SmallHeading>

        {issueType.map((rec, i) => (
          <div
            className="flex-rows items-center gap-2 justify-start mb-[6px]"
            key={i}
          >
            <button
              className={`h-5 w-5 rounded-full cursor-pointer ${
                selected === rec ? "border-6" : "border border-dark-500"
              }`}
              onClick={() => setSelected(rec)}
            ></button>

            <Text.SmallText
              className={`text-sm ${
                selected === rec ? "text-dark" : "text-dark-500"
              }`}
            >
              {rec}
            </Text.SmallText>
          </div>
        ))}
      </div>

      <div className="gap-2 w-full flex-cols">
        <Text.SmallText className="font-semibold text-sm">
          Describe the issue in details{" "}
        </Text.SmallText>
        <textarea
          rows={4}
          cols={4}
          className="text-input bg-purple-blue-50 w-full p-2"
          placeholder="Please provide specific details about what went wrong, when it happened and how you’d like it resolved."
        />
      </div>

      <SpecialBox className="p-3 flex-cols gap-2">
        <Text.SmallText className="font-semibold text-sm">
          What happens next?
        </Text.SmallText>

        {nextAct.map((rec, i) => (
          <div
            className="flex-rows items-center gap-2 justify-start mb-[6px]"
            key={i}
          >
            <button className={`h-1 w-1 rounded-full bg-dark-500`} />

            <Text.SmallText
              className={`text-sm ${
                selected === rec ? "text-dark" : "text-dark-500"
              }`}
            >
              {rec}
            </Text.SmallText>
          </div>
        ))}
      </SpecialBox>

      <div className="grid grid-cols-2 items-center gap-2 w-full">
        <Button onClick={onReport}>
          <Button.Text>Submit Review</Button.Text>
        </Button>
        <Button variant="secondary" onClick={onClose}>
          <Button.Text>Back</Button.Text>
        </Button>
      </div>
    </div>
  );
};

const SpecialBox = ({
  children,
  className,
  minHeight = "min-h-[96px]",
  isBtn,
  onClick,
  isRead,
}: {
  children: ReactNode;
  className?: string;
  minHeight?: string;
  isBtn?: boolean;
  onClick?: () => void;
  isRead?: boolean;
}) => {
  if (isBtn)
    return (
      <button
        className={`${
          isRead ? "bg-white" : "bg-purple-blue-50"
        } w-full ${minHeight}  rounded-lg ${className} cursor-pointer`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  return (
    <div
      className={`bg-purple-blue-50 w-full ${minHeight}  rounded-lg ${className}`}
    >
      {children}
    </div>
  );
};

export {
  CompletedToast,
  JobCompletedModal,
  JobDisputeModal,
  JobRatingModal,
  SpecialBox,
};
