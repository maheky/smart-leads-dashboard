import { Request, Response } from "express";
import Lead from "../models/lead.model";

// CREATE LEAD
export const createLead = async (
  req: Request,
  res: Response
) => {

  try {

    const lead = await Lead.create(req.body);

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error creating lead",
      error,
    });

  }
};

// GET ALL LEADS
export const getLeads = async (
  req: Request,
  res: Response
) => {

  try {

    const {
      status,
      source,
      search,
      sort,
    } = req.query;

    let query: any = {};

    // FILTER STATUS
    if (status) {
      query.status = status;
    }

    // FILTER SOURCE
    if (source) {
      query.source = source;
    }

    // SEARCH
    if (search) {

      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // SORT
    let sortOption: any = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    const leads = await Lead.find(query)
      .sort(sortOption);

    res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: leads,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error fetching leads",
      error,
    });

  }
};

// GET SINGLE LEAD
export const getLeadById = async (
  req: Request,
  res: Response
) => {

  try {

    const lead = await Lead.findById(
      req.params.id
    );

    if (!lead) {

      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });

    }

    res.status(200).json({
      success: true,
      message: "Lead fetched successfully",
      data: lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error fetching lead",
      error,
    });

  }
};

// UPDATE LEAD
export const updateLead = async (
  req: Request,
  res: Response
) => {

  try {

    const lead =
      await Lead.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!lead) {

      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });

    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error updating lead",
      error,
    });

  }
};

// DELETE LEAD
export const deleteLead = async (
  req: Request,
  res: Response
) => {

  try {

    const lead =
      await Lead.findByIdAndDelete(
        req.params.id
      );

    if (!lead) {

      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });

    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error deleting lead",
      error,
    });

  }
};