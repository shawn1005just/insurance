import Claim from "../models/Claim";
import { Response, Request } from "express";
import User from "../models/User";
import Weather from "../models/Weather";
import interactor from "../services/interactor";

export default {
  getAll: async (req: any, res: Response): Promise<void> => {
    let claims = await Claim.find({}).sort({ date: -1 });
    const result: any[] = [];
    for (var i = 0; i < claims.length; i++) {
      const customer: any = await User.findById(claims[i].clientID);
      result.push({ ...claims[i]._doc, customer_name: customer.fullname });
    }
    res.json(result);
  },
  getActive: async (req: any, res: Response): Promise<void> => {
    let claims = await Claim.find({
      clientID: req.user.id,
      status: "Pending",
      confirmed: false,
    }).sort({ date: -1 });
    res.json(claims);
  },
  getPast: async (req: any, res: Response): Promise<void> => {
    let claims = await Claim.find({
      clientID: req.user.id,
      status: { $in: ["Approved", "Declined"] },
    }).sort({ date: -1 });
    res.json(claims);
  },
  getAssigned: async (req: any, res: Response): Promise<void> => {
    let claims = await Claim.find({
      validatorID: req.user.id,
      status: { $in: ["Awaiting Validator"] },
    }).sort({ date: -1 });
    const result: any[] = [];
    for (var i = 0; i < claims.length; i++) {
      const customer: any = await User.findById(claims[i].clientID);
      result.push({
        ...claims[i]._doc,
        client_name: customer.fullname,
        client_address: customer.address.line1,
      });
    }
    res.json(result);
  },
  getAssessed: async (req: any, res: Response): Promise<void> => {
    let claims = await Claim.find({
      validatorID: req.user.id,
      status: { $in: ["Approved", "Declined"] },
    }).sort({ date: -1 });
    const result: any[] = [];
    for (var i = 0; i < claims.length; i++) {
      const customer: any = await User.findById(claims[i].clientID);
      result.push({
        ...claims[i]._doc,
        client_name: customer.fullname,
        client_address: customer.address.line1,
      });
    }
    res.json(result);
  },
  add: async (req: any, res: Response): Promise<void> => {
    const { weather, date, clientID, status } = req.body;
    let claim = new Claim({
      weather,
      clientID,
    });
    claim.save();
    res.json({ result: "success" });
  },
  feedback: async (req: any, res: Response): Promise<void> => {
    const { id, feedback } = req.body;
    let claim: any = await Claim.findById(id);
    if (feedback) {
      await interactor.ConfirmDamage(claim.weatherEventID);
      const rand = Math.floor(Math.random() * 1000) % 2;
      if (rand) claim.status = "Approved";
      else {
        const user = await User.findById(req.user.id);
        const validator: any = await User.findOne({
          role: "validator",
          city: user?.address.city,
        });
        claim.status = "Awaiting Validator";
        claim.validatorID = validator?._id;
      }
    } else claim.status = "Declined";
    claim.confirmed = true;
    claim.save();
    res.json({ result: claim.status, id });
  },
  validate: async (req: any, res: Response): Promise<void> => {
    const { id, confirm, detail, file } = req.body;
    let claim = await Claim.findById(id);
    if (claim) {
      claim.status = confirm ? "Approved" : "Declined";
      claim.detail = detail;
      claim.file = file;
      claim.save();
    }
    res.json({ result: "success" });
  },
};
