import { ErrorImageAssets } from "@/src/constants/assets/errorAssets";
import type { TFunction } from "i18next";
import type { ImageSourcePropType } from "react-native";

export type HttpErrorCategory = "4xx" | "5xx";

export const getHttpStatus = (error: unknown): number | null => {
  if (!error || typeof error !== "object") return null;

  const maybeError = error as {
    response?: { status?: unknown };
    status?: unknown;
  };

  const responseStatus = maybeError.response?.status;
  if (typeof responseStatus === "number") return responseStatus;

  if (typeof maybeError.status === "number") return maybeError.status;

  return null;
};

export const isNetworkOfflineError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as {
    code?: unknown;
    message?: unknown;
    response?: unknown;
    request?: unknown;
  };

  const code =
    typeof maybeError.code === "string" ? maybeError.code.toUpperCase() : "";
  const message =
    typeof maybeError.message === "string"
      ? maybeError.message.toLowerCase()
      : "";

  // Axios/network failures usually have request but no response.
  const hasNoResponse = !maybeError.response && !!maybeError.request;

  return (
    code === "ERR_NETWORK" ||
    code === "ECONNABORTED" ||
    message.includes("network error") ||
    message.includes("internet") ||
    message.includes("failed to fetch") ||
    hasNoResponse
  );
};

export const getHttpErrorCategory = (
  status: number | null,
): HttpErrorCategory => {
  if (status !== null && status >= 400 && status < 500) {
    return "4xx";
  }

  // Treat no-response/network failures as server-side connectivity issues.
  return "5xx";
};

export const getHttpErrorMessage = (
  status: number | null,
  t?: TFunction,
): string => {
  if (status === null) {
    return t
      ? t("common.networkErrors.offline")
      : "No internet connection. Please check your network and try again.";
  }

  // Specific status codes
  if (t) {
    switch (status) {
      case 400:
        return t("common.networkErrors.badRequest");
      case 401:
        return t("common.networkErrors.unauthorized");
      case 403:
        return t("common.networkErrors.forbidden");
      case 404:
        return t("common.networkErrors.notFound");
      case 409:
        return t("common.networkErrors.conflict");
      case 429:
        return t("common.networkErrors.tooManyRequests");
      case 504:
        return t("common.networkErrors.timeout");
    }
  }

  const category = getHttpErrorCategory(status);

  if (category === "4xx") {
    return t
      ? t("common.networkErrors.client")
      : "Something went wrong. Please try again.";
  }

  return t
    ? t("common.networkErrors.server")
    : "Server connection issue, please try again.";
};

export const getHttpErrorImage = (
  status: number | null,
): ImageSourcePropType => {
  const category = getHttpErrorCategory(status);
  return category === "4xx"
    ? ErrorImageAssets.error4xx
    : ErrorImageAssets.error5xx;
};
