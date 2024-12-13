import express from "express";
import { get_cat } from "../controllers/users.mjs";
const router = express.Router();

// ユーザーIDからスコアとchatgptのコメントを取得
router.get("/:line_id", get_cat);

export default router;
