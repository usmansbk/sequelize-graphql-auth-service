// models
export const USER_FIRST_NAME_LEN_ERROR = "UserFirstNameLengthError";
export const USER_FIRST_NAME_REQUIRED_ERROR = "UserFirstNameRequiredError";
export const USER_FIRST_NAME_EMPTY_ERROR = "UserFirstNameEmptyError";
export const USER_LAST_NAME_LEN_ERROR = "UserLastNameLengthError";
export const USER_USERNAME_LEN_ERROR = "UserNameLengthError";
export const USER_USERNAME_UNAVAILABLE_ERROR = "UserNameUnavailableError";
export const USER_USERNAME_EMPTY_ERROR = "UserNameEmptyError";
export const USER_LAST_NAME_REQUIRED_ERROR = "UserLastNameRequiredError";
export const USER_LAST_NAME_EMPTY_ERROR = "UserLastNameEmptyError";
export const USER_EMAIL_UNAVAILABLE_ERROR = "UserEmailUnavailableError";
export const USER_INVALID_EMAIL_ERROR = "UserInvalidEmailError";
export const USER_PHONE_NUMBER_UNAVAILABLE_ERROR =
  "UserPhoneNumberUnavailableError";
export const USER_PHONE_NUMBER_FORMAT_ERROR = "UserPhoneNumberFormatError";
export const USER_PASSWORD_LEN_ERROR = "UserInvalidPasswordLengthError";
export const USER_INVALID_PASSWORD_ERROR = "UserInvalidPasswordError";
export const USER_INVALID_LOCALE_ERROR = "UserInvalidLocaleError";
export const USER_INVALID_PICTURE_URL_ERROR = "UserInvalidPictureUrlError";
export const ROLE_NAME_FORMAT_ERROR = "RoleNameInvalidFormatError";
export const ROLE_NAME_LEN_ERROR = "RoleNameLengthError";

// jwt token
export const TOKEN_EXPIRED_ERROR = "TokenExpiredError";
export const TOKEN_INVALID_ERROR = "TokenInvalidError";
export const TOKEN_NOT_BEFORE_ERROR = "TokenNotBeforeError";

// resolvers
export const INCORRECT_EMAIL_OR_PASSWORD = "IncorrectEmailAndPassword";
export const SIGNUP_FAILED = "SignUpFailed";
export const WELCOME_NEW_USER = "WelcomeNewUser";
export const WELCOME_BACK = "WelcomeBack";
export const EMAIL_VERIFIED = "EmailVerified";
export const PASSWORD_CHANGED = "PasswordChanged";
export const USER_DOES_NOT_EXIST = "UserDoesNotExist";
export const ACCOUNT_DELETED = "AccountDeleted";
export const LOGGED_OUT = "LoggedOut";
export const PROFILE_UPDATED = "ProfileUpdated";
export const PHONE_NUMBER_VERIFIED = "PhoneNumberVerified";
export const SUCCESS = "Success";
export const FAIL = "Fail";
export const INVALID_LINK = "InvalidLink";
export const INVALID_OTP = "InvalidOtp";
export const EMAIL_NOT_VERIFIED = "EmailNotVerified";

// send emails
export const SENT_VERIFICATION_EMAIL = "SentVerificationEmail";
export const SENT_RESET_PASSWORD_EMAIL = "SentResetPasswordEmail";
export const SENT_CONFIRM_DELETE_ACCOUNT_EMAIL = "SentDeleteConfirmationEmail";
export const SENT_EMAIL_OTP = "SentEmailOtp";
export const SENT_SMS_OTP = "SentSmsOtp";

// upload
export const IMAGE_TOO_LARGE = "ImageFileTooLarge";
export const UNSUPPORTED_FILE_TYPE = "UnsupportedFileType";
export const NOTHING_TO_UPLOAD = "NothingToUpload";

// auth
export const UNAUTHORIZED = "Unauthorized";
export const UNAUTHENTICATED = "Unauthenticated";
export const SOMETHING_WENT_WRONG = "SomethingWentWrong";

// errors
export const FIELD_ERRORS = "FieldErrors";
export const ITEM_NOT_FOUND = "ItemNotFound";
