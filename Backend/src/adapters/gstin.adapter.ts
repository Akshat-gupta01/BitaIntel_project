/**
 * ─── GSTIN Adapter (BITAINTEL Verification Engine) ─────────────────────────────
 * Yeh adapter 3 mukhya kaam karta hai:
 * 1. 15-digit GSTIN ka regex format check karta hai.
 * 2. GSTIN me se State Code aur PAN Card alag nikaalta hai.
 * 3. Sarkari GSTN portal ki API call ko simulate karke ACTIVE status return karta hai.
 */

//1. Vendor GSTIN submit karta hai → 
// 2. System Format & PAN check karta hai (Status: PENDING) →
//  3. Admin / Auditor Queue Admin GSTIN & Document check karta hai → 
// 4. Admin APPROVE karta hai (Status: ACTIVE) → 
// 5. Scoring Engine Trigger Score badhta hai aur Level 2 milta hai


// ─── 1. Bharat ke mukhya GST State Codes ──────────────────────────────────────
export const GST_STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "36": "Telangana",
  "37": "Andhra Pradesh",
};

// ─── 2. Verification Result Interface ─────────────────────────────────────────
export interface GstnVerificationResult {
  isValid: boolean;                         // Format sahi hai ya nahi
  message: string;                          // User-friendly message
  gstin?: string;                           // Format kiya hua GSTIN
  pan?: string;                             // Nikala gaya 10-digit PAN
  stateCode?: string;                       // 2-digit State code (e.g. "27")
  stateName?: string;                       // State ka naam (e.g. "Maharashtra")
  gstnStatus?: "ACTIVE" | "SUSPENDED" | "CANCELLED" | "INVALID";
  taxpayerType?: string;                    // "Regular" ya "Composition"
  filingFrequency?: "Monthly" | "Quarterly"; // Returns kab bhare jaate hain
  lastSyncedAt?: Date;                      // Kab verify hua
}

// ─── 3. GSTIN Adapter Class ──────────────────────────────────────────────────
export class GstinAdapter {
  /**
   * GSTIN Regex Pattern:
   * ^[0-9]{2}      -> Pehle 2 ank: State code (01 - 37)
   * [A-Z]{5}       -> Agle 5 akshar: PAN card ke pehle 5 letters
   * [0-9]{4}       -> Agle 4 ank: PAN card ke 4 numbers
   * [A-Z]{1}       -> Agla 1 akshar: PAN card ka check letter
   * [1-9A-Z]{1}    -> Entity number (state me kitne business hain)
   * Z              -> By default 'Z' hota hai
   * [0-9A-Z]{1}$   -> Aakhri 1 checksum digit/letter
   */
  private static readonly GSTIN_REGEX =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  /**
   * 1. GSTIN Format Validator
   * Cheez check karta hai ki kya GSTIN 15 characters ka aur valid pattern me hai
   */
  public static validateFormat(gstin: string): boolean {
    if (!gstin || typeof gstin !== "string") {
      return false;
    }
    const cleanGstin = gstin.trim().toUpperCase();
    return this.GSTIN_REGEX.test(cleanGstin);
  }

  /**
   * 2. Extract PAN & State Code
   * GSTIN me se PAN (10-digits) aur State alag nikaal leta hai
   */
  public static extractDetails(gstin: string) {
    const cleanGstin = gstin.trim().toUpperCase();

    // Pehle 2 digits: State Code (e.g. "27")
    const stateCode = cleanGstin.substring(0, 2);

    // Characters 2 se 12 tak: PAN Card (e.g. "AAACB1234F")
    const pan = cleanGstin.substring(2, 12);

    // State code se State ka naam pata karo (Dictionary lookup)
    const stateName = GST_STATE_CODES[stateCode] || "Other / Unknown State";

    return {
      stateCode,
      stateName,
      pan,
    };
  }

  /**
   * 3. Mock GSTN Portal Verification
   * Sarkari GST portal par check simulate karta hai
   */
  public static async verify(gstin: string): Promise<GstnVerificationResult> {
    // A. Pehle format validate karo
    if (!this.validateFormat(gstin)) {
      return {
        isValid: false,
        gstnStatus: "INVALID",
        message: "Invalid GSTIN format. It must be a valid 15-character Indian GSTIN (e.g. 27AAACB1234F1Z5).",
      };
    }

    const cleanGstin = gstin.trim().toUpperCase();

    // B. State aur PAN extract karo
    const { stateCode, stateName, pan } = this.extractDetails(cleanGstin);

    // C. Simulated Portal Response (Real enterprise portal jaisa)
    return {
      isValid: true,
      gstin: cleanGstin,
      pan,
      stateCode,
      stateName,
      gstnStatus: "ACTIVE",
      taxpayerType: "Regular",
      filingFrequency: "Monthly",
      lastSyncedAt: new Date(),
      message: `GSTIN verified successfully for ${stateName} jurisdiction. Entity is ACTIVE.`,
    };
  }
}

export default GstinAdapter;

