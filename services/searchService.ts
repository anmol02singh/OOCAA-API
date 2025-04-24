import { SearchParams, TcaRange } from "../config/types";
import {
  findEvents,
  findLimitedEvents,
  getAllEventsFromDB,
} from "../repositories/searchRepository";

export async function fetchAllEvents() {
  try {
    return await getAllEventsFromDB();
  } catch (error) {
    console.error("Error in service (fetchAllEvents):", error);
    throw error;
  }
}

export const getEvents = async (
  searchParams: SearchParams[],
  tcaRange: TcaRange,
  extraFilters: {
    missDistanceValue?: number;
    missDistanceOperator?: "lte" | "gte" | "eq";
    collisionProbabilityValue?: number;
    collisionProbabilityOperator?: "lte" | "gte" | "eq";
    operatorOrganization?: string;
  }
) => {
  const [tcaStart, tcaEnd] = tcaRange;

  const tcaStartDate = new Date(parseInt(tcaStart));
  const tcaEndDate = new Date(parseInt(tcaEnd));

  const queries = searchParams.map(({ criteria, value }: SearchParams) => {
    switch (criteria) {
      case "objectDesignator":
        return {
          $or: [
            { primaryObjectDesignator: { $regex: value, $options: "i" } },
            { secondaryObjectDesignator: { $regex: value, $options: "i" } },
          ],
        };
      case "objectType":
        return {
          $or: [
            { primaryObjectType: { $regex: value, $options: "i" } },
            { secondaryObjectType: { $regex: value, $options: "i" } },
          ],
        };
      case "objectName":
        return {
          $or: [
            { primaryObjectName: { $regex: value, $options: "i" } },
            { secondaryObjectName: { $regex: value, $options: "i" } },
          ],
        };
      default:
        return { [criteria]: { $regex: value, $options: "i" } };
    }
  });

  const additionalFilters = [];

  if (
    extraFilters.missDistanceValue != null &&
    extraFilters.missDistanceOperator
  ) {
    let operator;
    switch (extraFilters.missDistanceOperator) {
      case "lte":
        operator = { $lte: extraFilters.missDistanceValue };
        break;
      case "gte":
        operator = { $gte: extraFilters.missDistanceValue };
        break;
      case "eq":
        operator = { $eq: extraFilters.missDistanceValue };
        break;
    }
    additionalFilters.push({
      missDistances: { $elemMatch: operator },
    });
  }

  if (
    extraFilters.collisionProbabilityValue != null &&
    extraFilters.collisionProbabilityOperator
  ) {
    let operator;
    switch (extraFilters.collisionProbabilityOperator) {
      case "lte":
        operator = { $lte: extraFilters.collisionProbabilityValue };
        break;
      case "gte":
        operator = { $gte: extraFilters.collisionProbabilityValue };
        break;
      case "eq":
        const tolerance = extraFilters.collisionProbabilityValue * 0.05;
        operator = {
          $gte: extraFilters.collisionProbabilityValue - tolerance,
          $lte: extraFilters.collisionProbabilityValue + tolerance,
        };
        break;
    }
    additionalFilters.push({
      collisionProbabilities: { $elemMatch: operator },
    });
  }

  if (extraFilters.operatorOrganization) {
    additionalFilters.push({
      $or: [
        {
          primaryOperatorOrganization: {
            $regex: extraFilters.operatorOrganization,
            $options: "i",
          },
        },
        {
          secondaryOperatorOrganization: {
            $regex: extraFilters.operatorOrganization,
            $options: "i",
          },
        },
      ],
    });
  }

  const query = {
    $and: [
      ...queries,
      { tca: { $gte: tcaStartDate, $lte: tcaEndDate } },
      ...additionalFilters,
    ],
  };

  return await findEvents(query);
};

export const getLimitedEvents = async (
  searchParams: SearchParams[],
  tcaRange: TcaRange,
  extraFilters: {
    missDistanceValue?: number;
    missDistanceOperator?: "lte" | "gte" | "eq";
    collisionProbabilityValue?: number;
    collisionProbabilityOperator?: "lte" | "gte" | "eq";
    operatorOrganization?: string;
  }
) => {
  const [tcaStart, tcaEnd] = tcaRange;

  const tcaStartDate = new Date(parseInt(tcaStart));
  const tcaEndDate = new Date(parseInt(tcaEnd));

  const queries = searchParams.map(({ criteria, value }: SearchParams) => {
    switch (criteria) {
      case "objectDesignator":
        return {
          $or: [
            { primaryObjectDesignator: { $regex: value, $options: "i" } },
            { secondaryObjectDesignator: { $regex: value, $options: "i" } },
          ],
        };
      case "objectType":
        return {
          $or: [
            { primaryObjectType: { $regex: value, $options: "i" } },
            { secondaryObjectType: { $regex: value, $options: "i" } },
          ],
        };
      case "objectName":
        return {
          $or: [
            { primaryObjectName: { $regex: value, $options: "i" } },
            { secondaryObjectName: { $regex: value, $options: "i" } },
          ],
        };
      default:
        return { [criteria]: { $regex: value, $options: "i" } };
    }
  });

  const additionalFilters = [];

  if (
    extraFilters.missDistanceValue != null &&
    extraFilters.missDistanceOperator
  ) {
    let operator;
    switch (extraFilters.missDistanceOperator) {
      case "lte":
        operator = { $lte: extraFilters.missDistanceValue };
        break;
      case "gte":
        operator = { $gte: extraFilters.missDistanceValue };
        break;
      case "eq":
        operator = { $eq: extraFilters.missDistanceValue };
        break;
    }
    additionalFilters.push({
      missDistances: { $elemMatch: operator },
    });
  }

  if (
    extraFilters.collisionProbabilityValue != null &&
    extraFilters.collisionProbabilityOperator
  ) {
    let operator;
    switch (extraFilters.collisionProbabilityOperator) {
      case "lte":
        operator = { $lte: extraFilters.collisionProbabilityValue };
        break;
      case "gte":
        operator = { $gte: extraFilters.collisionProbabilityValue };
        break;
      case "eq":
        const tolerance = extraFilters.collisionProbabilityValue * 0.05;
        operator = {
          $gte: extraFilters.collisionProbabilityValue - tolerance,
          $lte: extraFilters.collisionProbabilityValue + tolerance,
        };
        break;
    }
    additionalFilters.push({
      collisionProbabilities: { $elemMatch: operator },
    });
  }

  if (extraFilters.operatorOrganization) {
    additionalFilters.push({
      $or: [
        {
          primaryOperatorOrganization: {
            $regex: extraFilters.operatorOrganization,
            $options: "i",
          },
        },
        {
          secondaryOperatorOrganization: {
            $regex: extraFilters.operatorOrganization,
            $options: "i",
          },
        },
      ],
    });
  }

  const query = {
    $and: [
      ...queries,
      { tca: { $gte: tcaStartDate, $lte: tcaEndDate } },
      ...additionalFilters,
    ],
  };

  return await findLimitedEvents(query);
};
