"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const feedbackSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  date: z.string().min(1, "Date is required"),
  contactName: z.string().min(1, "Contact name is required"),
  companyName: z.string().min(1, "Company name is required"),
  country: z.string().min(1, "Country is required"),
  salesOrderNumber: z.string().min(1, "Sales order number is required"),
  toolBuildQuality: z.number().min(1).max(10),
  packaging: z.number().min(1).max(10),
  onTimeDelivery: z.number().min(1).max(10),
  afterSalesSupport: z.number().min(1).max(10),
  productUsability: z.number().min(1).max(10),
  recommendationScore: z.number().min(1).max(10),
  suggestions: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const allValues = watch();

  // Calculate progress
  const totalFields = 13; // 6 contact fields + 6 ratings + 1 suggestions (optional)
  const requiredFields = 12; // excluding suggestions
  const filledFields = [
    allValues.email,
    allValues.date,
    allValues.contactName,
    allValues.companyName,
    allValues.country,
    allValues.salesOrderNumber,
    allValues.toolBuildQuality,
    allValues.packaging,
    allValues.onTimeDelivery,
    allValues.afterSalesSupport,
    allValues.productUsability,
    allValues.recommendationScore,
  ].filter(Boolean).length;

  const progress = Math.round((filledFields / requiredFields) * 100);

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
        reset({ date: new Date().toISOString().split("T")[0] });
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingScale = ({
    name,
    label,
  }: {
    name: keyof FeedbackFormData;
    label: string;
  }) => {
    const value = watch(name);

    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-800">
          {label} <span className="text-[#D6312F]">*</span>
        </label>
        <div className="bg-gray-50 p-3 sm:p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <span className="text-xs font-medium text-gray-500 sm:min-w-[60px]">
              Poor
            </span>
            <div className="flex gap-1.5 sm:gap-2 flex-1 justify-center flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <label
                  key={num}
                  className="relative flex flex-col items-center cursor-pointer group"
                  onClick={(e) => {
                    e.preventDefault();
                    setValue(name, num, { shouldValidate: true });
                  }}
                >
                  <input
                    type="radio"
                    value={num}
                    checked={value === num}
                    onChange={() => {}}
                    className="peer sr-only"
                  />
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 border-2 flex items-center justify-center font-semibold text-xs sm:text-sm transition-all
                    ${
                      value === num
                        ? "bg-[#D6312F] border-[#D6312F] text-white shadow-lg scale-110"
                        : "bg-white border-gray-300 text-gray-600 hover:border-[#D6312F] hover:text-[#D6312F] hover:scale-105"
                    }`}
                  >
                    {num}
                  </div>
                </label>
              ))}
            </div>
            <span className="text-xs font-medium text-gray-500 sm:min-w-[60px] sm:text-right">
              Excellent
            </span>
          </div>
        </div>
        {errors[name] && (
          <p className="text-[#D6312F] text-xs mt-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors[name]?.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
        <div className="relative h-3 bg-gray-100 rounded-b-xl overflow-hidden">
          {/* Progress Fill */}
          <div
            className="h-full bg-gradient-to-r from-[#D6312F] via-[#E64A48] to-[#A52520] rounded-b-xl transition-all duration-500 ease-out shadow-inner"
            style={{ width: `${progress}%` }}
          />

          {/* Floating Bubble Indicator */}
          {progress > 0 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
              style={{ left: `${progress}%` }}
            >
              <div className="relative -ml-8">
                <div className="bg-[#D6312F] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xl whitespace-nowrap border border-white">
                  {progress}%
                </div>

                {/* Pointer */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-[#D6312F] rotate-45 border-l border-b border-white"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white py-3 shadow-lg">
        <div className="flex justify-center items-center px-4">
          <img
            src="/images/logo.png"
            alt="Tritorc Logo"
            className="w-44 h-16 sm:w-52 sm:h-20 object-contain"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <div className="bg-white shadow-xl border border-gray-100 overflow-hidden">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 sm:p-6 md:p-8 border-b border-gray-200 text-center">
            <span className="block font-semibold text-[#D6312F] text-base sm:text-lg mb-2 sm:mb-3">
              Welcome to the Tritorc Family!
            </span>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              It is great having you be a part of our burgeoning group as a
              valued customer. We would love to hear from you about what you
              think of our products and after-sales services.
            </p>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Success Message */}
            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold text-sm sm:text-base">
                      Thank you for your feedback!
                    </p>
                    <p className="text-green-700 text-xs sm:text-sm mt-1">
                      Your response has been recorded successfully.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-800 font-semibold text-sm sm:text-base">
                      Submission Failed
                    </p>
                    <p className="text-red-700 text-xs sm:text-sm mt-1">
                      Something went wrong. Please try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Information Section */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#D6312F] inline-block">
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address <span className="text-[#D6312F]">*</span>
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-[#D6312F] focus:border-transparent transition-all bg-gray-50 focus:bg-white text-black"
                      placeholder="your.email@company.com"
                    />
                    {errors.email && (
                      <p className="text-[#D6312F] text-xs mt-2 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Date <span className="text-[#D6312F]">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("date")}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-[#D6312F] focus:border-transparent transition-all bg-gray-50 focus:bg-white text-black"
                    />
                    {errors.date && (
                      <p className="text-[#D6312F] text-xs mt-2">
                        {errors.date.message}
                      </p>
                    )}
                  </div>

                  {/* Contact Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Contact Name <span className="text-[#D6312F]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("contactName")}
                      className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-[#D6312F] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="John Doe"
                    />
                    {errors.contactName && (
                      <p className="text-[#D6312F] text-xs mt-2">
                        {errors.contactName.message}
                      </p>
                    )}
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Company Name <span className="text-[#D6312F]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("companyName")}
                      className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-[#D6312F] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="Your Company Ltd."
                    />
                    {errors.companyName && (
                      <p className="text-[#D6312F] text-xs mt-2">
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Country <span className="text-[#D6312F]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("country")}
                      className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-[#D6312F] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="India"
                    />
                    {errors.country && (
                      <p className="text-[#D6312F] text-xs mt-2">
                        {errors.country.message}
                      </p>
                    )}
                  </div>

                  {/* Sales Order Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Sales Order / Invoice Number{" "}
                      <span className="text-[#D6312F]">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("salesOrderNumber")}
                      className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-[#D6312F] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="SO-2025-001"
                    />
                    {errors.salesOrderNumber && (
                      <p className="text-[#D6312F] text-xs mt-2">
                        {errors.salesOrderNumber.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="pt-6 border-t-2 border-gray-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-6 pb-2 border-b-2 border-[#D6312F] inline-block">
                  Rate Your Experience
                </h3>

                <div className="space-y-6 mt-6">
                  <RatingScale
                    name="toolBuildQuality"
                    label="Tool Build Quality"
                  />
                  <RatingScale name="packaging" label="Packaging" />
                  <RatingScale name="onTimeDelivery" label="On-Time Delivery" />
                  <RatingScale
                    name="afterSalesSupport"
                    label="After-Sales Support"
                  />
                  <RatingScale
                    name="productUsability"
                    label="Product Usability and Operation"
                  />
                  <RatingScale
                    name="recommendationScore"
                    label="How likely are you to recommend Tritorc to others?"
                  />
                </div>
              </div>

              {/* Suggestions */}
              <div className="pt-6 border-t-2 border-gray-100">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Suggestions for Improvement, Observations, Remarks
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Optional - Help us improve by sharing your thoughts
                </p>
                <textarea
                  {...register("suggestions")}
                  rows={5}
                  className="text-black w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 focus:ring-2 focus:ring-[#D6312F] focus:border-transparent transition-all resize-none bg-gray-50 focus:bg-white"
                  placeholder="Your feedback is valuable to us. Please share any additional comments or suggestions..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#D6312F] to-[#A52520] hover:from-[#A52520] hover:to-[#8B1F1C] text-white font-bold py-3 sm:py-4 px-6 text-sm sm:text-base transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting Your Feedback...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submit Feedback
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[#D6312F]">
              Tritorc Equipments
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
