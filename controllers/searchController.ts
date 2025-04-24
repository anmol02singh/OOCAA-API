import { Request, Response } from "express";
import {
  getEvents,
  fetchAllEvents,
  getLimitedEvents,
} from "../services/searchService";
import { SearchParams, TcaRange } from "../config/types";

export async function getAllEvents(req: Request, res: Response): Promise<void> {
  try {
    const events = await fetchAllEvents();
    if (!events || events.length === 0) {
      res.status(404).json({ message: "No events found" });
      return;
    }
    res.status(200).json(events);
  } catch (error) {
    console.error("Error in controller (getAllEvents):", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const searchEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const searchParams: SearchParams[] = req.body.searchParams;
  const tcaRange: TcaRange = req.body.tcaRange;

  const missDistanceValue = req.body.missDistanceValue;
  const missDistanceOperator = req.body.missDistanceOperator;
  const collisionProbabilityValue = req.body.collisionProbabilityValue;
  const collisionProbabilityOperator = req.body.collisionProbabilityOperator;
  const operatorOrganization = req.body.operatorOrganization;

  if (!tcaRange || tcaRange.length !== 2) {
    res.status(400).json({ message: "TCA range is required" });
    return;
  }

  try {
    const results = await getEvents(searchParams, tcaRange, {
      missDistanceValue,
      missDistanceOperator,
      collisionProbabilityValue,
      collisionProbabilityOperator,
      operatorOrganization,
    });
    res.status(200).json(results);
  } catch (error) {
    console.error("Error searching CDMs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchLimitedEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const searchParams: SearchParams[] = req.body.searchParams;
  const tcaRange: TcaRange = req.body.tcaRange;

  const missDistanceValue = req.body.missDistanceValue;
  const missDistanceOperator = req.body.missDistanceOperator;
  const collisionProbabilityValue = req.body.collisionProbabilityValue;
  const collisionProbabilityOperator = req.body.collisionProbabilityOperator;
  const operatorOrganization = req.body.operatorOrganization;

  if (!tcaRange || tcaRange.length !== 2) {
    res.status(400).json({ message: "TCA range is required" });
    return;
  }

  try {
    const results = await getLimitedEvents(searchParams, tcaRange, {
      missDistanceValue,
      missDistanceOperator,
      collisionProbabilityValue,
      collisionProbabilityOperator,
      operatorOrganization,
    });
    res.status(200).json(results);
  } catch (error) {
    console.error("Error searching CDMs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
