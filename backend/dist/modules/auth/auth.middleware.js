import { logger, serializeError } from "../../config/logger.js";
import { extractBearerToken, getAuthenticatedUser, verifyAuthToken } from "./auth.service.js";
export async function requireAuth(req, res, next) {
    try {
        const token = extractBearerToken(req.header("authorization"));
        const decodedToken = verifyAuthToken(token);
        const user = await getAuthenticatedUser(decodedToken.sub);
        req.authUser = user;
        next();
    }
    catch (error) {
        if (isAuthError(error)) {
            logger.warn("Auth middleware rejected request.", {
                requestId: req.requestId,
                message: error.message,
            });
            res.status(error.statusCode).json({
                message: error.message,
            });
            return;
        }
        logger.error("Auth middleware failed unexpectedly.", {
            requestId: req.requestId,
            error: serializeError(error),
        });
        res.status(500).json({
            message: "Unable to authenticate request.",
        });
    }
}
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.authUser) {
            res.status(401).json({
                message: "Authentication is required.",
            });
            return;
        }
        if (!allowedRoles.includes(req.authUser.role)) {
            logger.warn("Auth middleware rejected request due to role mismatch.", {
                requestId: req.requestId,
                userId: req.authUser.id,
                userRole: req.authUser.role,
                allowedRoles,
            });
            res.status(403).json({
                message: "You do not have permission to access this resource.",
            });
            return;
        }
        next();
    };
}
function isAuthError(error) {
    return typeof error === "object" && error !== null && "statusCode" in error && "message" in error && typeof error.statusCode === "number";
}
//# sourceMappingURL=auth.middleware.js.map