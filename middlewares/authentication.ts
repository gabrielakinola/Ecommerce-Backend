import { Request, Response, NextFunction } from "express";
import passport from "passport";

import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import User from "../src/models/userModel";
import { JwtPayload } from "jsonwebtoken";

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload: JwtPayload, done) => {
    try {
      const user = await User.findById(jwt_payload.sub);

      if (user) {
        return done(null, user);
      } else {
        done(null, false, "Invalid token");
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

export const ensureIsAuthenicated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", {
    session: false,
  })(req, res, next);
};
