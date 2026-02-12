# Merchant Components Translation Extraction Plan

## Files Analyzed:
1. **Merchant Settings** - MerchantSettings.jsx and all components
2. **Coupons** - All coupon listing, creation, and detail components
3. **Wallet** - Wallet container and all parts (annual, temporary, summary, warnings)
4. **Campaigns** - Campaign management components
5. **Festival Messages** - Festival message components

## Translation Structure:

### merchantDashboard.json
```json
{
  "settings": {
    "header": {
      "merchantHub": "Merchant Hub",
      "version": "Version 2.0",
      "strategyControl": "Strategy Control",
      "description": "Manage your global engagement, reward mechanisms, and promotional content from a single high-performance dashboard.",
      "status": "Status",
      "merchantActive": "Merchant Active"
    },
    "tabs": {
      "paidAds": "Paid Ads",
      "settings": "Settings",
      "automations": "Automations",
      "festivalMessages": "Festival Messages",
      "campaigns": "Campaigns"
    },
    "proTip": {
      "title": "Pro Tip",
      "message": "Merging Direct Rewards with powerful Presets creates a high-conversion feedback loop that skyrockets your local SEO."
    }
  },
  "coupons": {
    "listing": {
      "title": "Coupon Batches",
      "description": "Manage your discount coupons",
      "createBatch": "Create Batch",
      "searchPlaceholder": "Search batches...",
      "deletedSuccess": "Coupon batch deleted",
      "errors": {
        "loadFailed": "Failed to load coupons batches",
        "deleteFailed": "Failed to delete coupon batch"
      }
    }
  },
  "wallet": {
    "errors": {
      "noMerchantId": "Unable to determine merchant wallet. Please contact support.",
      "loadFailed": "Unable to load wallet. Please retry.",
      "insufficientCredits": "Insufficient credits or expired. Please check your wallet.",
      "validationFailed": "Validation failed"
    }
  }
}
```

## Next Steps:
1. Read all component files systematically
2. Extract every user-facing string
3. Organize by feature/component
4. Create comprehensive translation files
5. Update components to use translations
