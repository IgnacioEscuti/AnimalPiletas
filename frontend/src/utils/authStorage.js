const EMAIL_KEY = "animalpiletas_email";

export const getEmailRecordado = () => localStorage.getItem(EMAIL_KEY);

export const setEmailRecordado = (email) => localStorage.setItem(EMAIL_KEY, email);

export const borrarEmailRecordado = () => localStorage.removeItem(EMAIL_KEY);
