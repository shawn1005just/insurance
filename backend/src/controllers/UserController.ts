import User from "../models/User";
import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CoverageHistory from "../models/CoverageHistory";
import TransactionHistory from "../models/TransactionHistory";
import Claim from "../models/Claim";
import interactor from "../services/interactor";
import Notification from "../models/Notification";
import Coverage from "../models/Coverage";

export default {
  getClients: async (req: any, res: Response): Promise<void> => {
    try {
      let clients = await User.find({ role: "customer" }).select(
        "-password -__v -role"
      );
      const result: any[] = [];
      for (var i = 0; i < clients.length; i++) {
        const coverages = await CoverageHistory.count({
          clientID: clients[i]._id,
          subscription_date: { $lt: new Date() },
          expire_date: { $gt: new Date() },
        });
        const raised_claims = await Claim.count({
          clientID: clients[i]._id,
        });
        const account = await interactor.ReadAsset(clients[i]._id as string);
        result.push({
          ...clients[i]._doc,
          coverages,
          raised_claims,
          balance: account.balance,
        });
      }
      res.json(result);
    } catch (err) {
      res.status(500).send("Server Error");
    }
  },

  getValidators: async (req: any, res: Response): Promise<void> => {
    try {
      let validators = await User.find({ role: "validator" }).select(
        "-password -__v -role"
      );
      const result: any[] = [];
      for (var i = 0; i < validators.length; i++) {
        let claims = await Claim.count({
          validatorID: validators[i]._id,
          status: { $in: ["Approved", "Declined"] },
        });
        result.push({ ...validators[i]._doc, claims });
      }
      res.json(result);
    } catch (err) {
      res.status(500).send("Server Error");
    }
  },

  getClient: async (req: any, res: Response): Promise<void> => {
    const active: any[] = [],
      history: any[] = [];
    const coverages = await CoverageHistory.find({
      clientID: req.params.id,
    });
    for (let i = 0; i < coverages.length; i++) {
      const coverage = await Coverage.findById(coverages[i].coverageID);
      const raised_claims = await Claim.count({
        $and: [
          { clientID: req.params.id },
          { weather: coverage?.weather },
          { date: { $gt: coverages[i].subscription_date } },
          { date: { $lt: coverages[i].expire_date } },
        ],
      });
      const total =
        (await Claim.count({
          $and: [
            { clientID: req.params.id },
            { weather: coverage?.weather },
            { date: { $gt: coverages[i].subscription_date } },
            { date: { $lt: coverages[i].expire_date } },
            { status: "Approved" },
          ],
        })) * coverage?.reimbursement;
      const now = new Date();
      if (
        now > coverages[i].subscription_date &&
        now < coverages[i].expire_date
      )
        active.push({
          key: coverages[i]._id,
          name: coverage?.weather,
          sub_date: coverages[i].subscription_date,
          exp_date: coverages[i].expire_date,
          raised_claims,
          total,
        });
      else
        history.push({
          key: coverages[i]._id,
          name: coverage?.weather,
          sub_date: coverages[i].subscription_date,
          exp_date: coverages[i].expire_date,
          raised_claims,
          total,
        });
    }
    res.send({ active, history });
  },

  load: async (req: any, res: Response): Promise<void> => {
    try {
      let user = await User.findById(req.user.id).select("-password");
      const notifications = await Notification.count({
        clientID: req.user.id,
        read: false,
      });
      if (user?.role === "customer") {
        const active_coverages = await CoverageHistory.find({
          clientID: req.user.id,
          subscription_date: { $lt: new Date() },
          expire_date: { $gt: new Date() },
        });
        const claims = await Claim.count({
          clientID: req.user.id,
        });
        const transaction_histories = await TransactionHistory.find({
          clientID: req.user.id,
        })
          .sort({ date: -1 })
          .limit(2);
        const account = await interactor.ReadAsset(req.user.id);

        res.json({
          user,
          active_coverages,
          transaction_histories,
          claims,
          balance: account.balance,
          notifications,
        });
        return;
      }
      res.json({ user, notifications });
    } catch (err) {
      res.status(500).send("Server Error");
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        res.status(400).json({ errors: { msg: "Invalid Credentials" } });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ errors: { msg: "Invalid Credentials" } });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        "password",
        { expiresIn: "5 days" },
        (err: any, token: any) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      res.status(500).send("Server error");
    }
  },
  signup: async (req: Request, res: Response): Promise<void> => {
    const {
      fullname,
      username,
      email,
      password,
      line1,
      line2,
      city,
      latitude,
      longitude,
    } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: { msg: "User already exists" } });
        return;
      }

      user = new User({
        fullname,
        username,
        email,
        password,
        address: { line1, line2, city, latitude, longitude },
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();
      await interactor.CreateAccount(user._id as string);

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        "password",
        { expiresIn: "5 days" },
        (err: any, token: any) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      res.status(500).send("Server error");
    }
  },
  addValidator: async (req: Request, res: Response): Promise<void> => {
    const {
      fullname,
      username,
      email,
      password,
      line1,
      line2,
      city,
      latitude,
      longitude,
      operation,
      active,
      signature,
    } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: { msg: "User already exists" } });
        return;
      }

      user = new User({
        fullname,
        username,
        email,
        password,
        address: { line1, line2, city, latitude, longitude },
        city: operation,
        active,
        signature,
        role: "validator",
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      res.json({ result: "success" });
    } catch (error) {
      res.status(500).send("Server error");
    }
  },
  updateProfile: async (req: Request, res: Response): Promise<void> => {
    const {
      fullname,
      username,
      email,
      password,
      line1,
      line2,
      city,
      latitude,
      longitude,
    } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        user.fullname = fullname;
        user.username = username;
        user.address = { line1, line2, city, latitude, longitude };
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      }

      res.json({ result: "success" });
    } catch (error) {
      res.status(500).send("Server error");
    }
  },
  updateValidator: async (req: Request, res: Response): Promise<void> => {
    const {
      fullname,
      username,
      email,
      password,
      line1,
      line2,
      city,
      latitude,
      longitude,
      operation,
      active,
      signature,
    } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        user.fullname = fullname;
        user.username = username;
        user.address = { line1, line2, city, latitude, longitude };
        user.city = operation;
        user.active = active;
        user.signature = signature;
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      }

      res.json({ result: "success" });
    } catch (error) {
      res.status(500).send("Server error");
    }
  },
  loadNotification: async (req: any, res: Response) => {
    const notifications = await Notification.find({
      clientID: req.user.id,
      read: false,
    });
    await Notification.updateMany(
      { clientID: req.user.id, read: false },
      { read: true }
    );
    res.json(notifications);
  },
};
