export type CreateLinkRequest = {
  longUrl: string;
  customCode?: string;
};

export type CreateLinkResponse = {
  code: string;
  shortUrl: string;
  longUrl: string;
};
