#!/usr/bin/env python3
"""
Extract 2018-2020 sales tax data from annual summary files and merge with consolidated data.

The 2019/2020 source files have a different format than 2021+:
- 2019 file (loytd2019.xlsx): Contains 2018 and 2019 annual totals
- 2020 file (loytd2020.xlsx): Contains 2019 and 2020 annual totals

This script extracts the data and merges it with the existing consolidated file.
"""

import pandas as pd
from pathlib import Path

# Target entities (Johnson County, Wyandotte County, and JoCo cities)
TARGET_ENTITIES = {
    # Counties
    'Johnson County': 'Johnson County',
    'Wyandotte County': 'Wyandotte County',
    # Cities (normalize variations)
    'Overland Park': 'Overland Park',
    'Olathe': 'Olathe',
    'Shawnee': 'Shawnee',
    'Lenexa': 'Lenexa',
    'Leawood': 'Leawood',
    'Prairie Village': 'Prairie Village',
    'Gardner': 'Gardner',
    'Merriam': 'Merriam',
    'Mission': 'Mission',
    'Roeland Park': 'Roeland Park',
    'Fairway': 'Fairway',
    'Mission Hills': 'Mission Hills',
    'Westwood': 'Westwood',
    'Westwood Hills': 'Westwood Hills',
    'Mission Woods': 'Mission Woods',
    'DeSoto': 'DeSoto',
    'Edgerton': 'Edgerton',
    'Spring Hill': 'Spring Hill',
}


def extract_annual_data(filepath: Path, prior_year: int, current_year: int) -> pd.DataFrame:
    """
    Extract annual sales tax data from the summary format files.

    These files have structure:
    - Col 0: County/City name
    - Col 3: Prior year amount
    - Col 4: Current year amount
    """
    df = pd.read_excel(filepath, header=None)

    records = []

    for _, row in df.iterrows():
        entity_raw = str(row[0]).strip() if pd.notna(row[0]) else ''

        # Check if this entity is one we want
        matched_entity = None
        for search_name, canonical_name in TARGET_ENTITIES.items():
            if entity_raw.lower() == search_name.lower():
                matched_entity = canonical_name
                break

        if matched_entity:
            prior_amount = row[3] if pd.notna(row[3]) and isinstance(row[3], (int, float)) else 0
            current_amount = row[4] if pd.notna(row[4]) and isinstance(row[4], (int, float)) else 0

            # Add prior year record
            records.append({
                'Entity': matched_entity,
                'Tax_Type': 'Local Sales Tax',
                'Year': prior_year,
                'Month': 6,  # Use June as midpoint for annual data (no monthly breakdown)
                'Amount': float(prior_amount)
            })

            # Add current year record
            records.append({
                'Entity': matched_entity,
                'Tax_Type': 'Local Sales Tax',
                'Year': current_year,
                'Month': 6,  # Use June as midpoint for annual data
                'Amount': float(current_amount)
            })

    return pd.DataFrame(records)


def main():
    data_dir = Path('data/annual_sales_tax')

    print("=" * 70)
    print("EXTRACTING 2018-2020 SALES TAX DATA")
    print("=" * 70)

    # Extract from 2019 file (contains 2018 and 2019 data)
    print("\n📁 Processing loytd2019.xlsx (2018-2019 data)...")
    df_2019 = extract_annual_data(data_dir / 'loytd2019.xlsx', 2018, 2019)
    print(f"   Extracted {len(df_2019)} records")

    # Extract from 2020 file (contains 2019 and 2020 data)
    print("\n📁 Processing loytd2020.xlsx (2019-2020 data)...")
    df_2020 = extract_annual_data(data_dir / 'loytd2020.xlsx', 2019, 2020)
    print(f"   Extracted {len(df_2020)} records")

    # Combine and deduplicate (2019 appears in both files)
    df_extracted = pd.concat([df_2019, df_2020], ignore_index=True)

    # Keep only one 2019 value per entity (they should match, but prefer the 2019 file's version)
    df_extracted = df_extracted.drop_duplicates(
        subset=['Entity', 'Tax_Type', 'Year'],
        keep='first'
    )

    print(f"\n✓ Combined: {len(df_extracted)} unique records")

    # Show extracted data summary
    print("\n" + "=" * 70)
    print("EXTRACTED DATA SUMMARY")
    print("=" * 70)

    summary = df_extracted.pivot_table(
        index='Entity',
        columns='Year',
        values='Amount',
        aggfunc='sum'
    )
    print(summary.to_string())

    # Load existing consolidated file
    print("\n" + "=" * 70)
    print("MERGING WITH EXISTING DATA")
    print("=" * 70)

    consolidated_path = Path('data/johnson_wyandotte_tax_consolidated.xlsx')
    df_existing = pd.read_excel(consolidated_path)

    print(f"\n📊 Existing data: {len(df_existing)} records")
    print(f"   Years: {sorted(df_existing['Year'].unique())}")

    # Remove placeholder 2019 rows (Amount = 0)
    df_existing_clean = df_existing[
        ~((df_existing['Year'] == 2019) & (df_existing['Amount'] == 0))
    ].copy()

    removed = len(df_existing) - len(df_existing_clean)
    print(f"   Removed {removed} placeholder 2019 rows")

    # Also remove any existing 2018/2020 rows if present
    df_existing_clean = df_existing_clean[
        ~df_existing_clean['Year'].isin([2018, 2020])
    ].copy()

    # Merge
    df_merged = pd.concat([df_existing_clean, df_extracted], ignore_index=True)
    df_merged = df_merged.sort_values(['Entity', 'Tax_Type', 'Year', 'Month'])

    print(f"\n✓ Merged data: {len(df_merged)} records")
    print(f"   Years: {sorted(df_merged['Year'].unique())}")

    # Verify annual totals by year
    print("\n" + "=" * 70)
    print("ANNUAL TOTALS BY YEAR (Local Sales Tax)")
    print("=" * 70)

    annual = df_merged[df_merged['Tax_Type'] == 'Local Sales Tax'].groupby('Year')['Amount'].sum() / 1e6
    for year, total in annual.items():
        marker = " ← NEW" if year in [2018, 2019, 2020] else ""
        print(f"   {year}: ${total:,.1f}M{marker}")

    # Save
    backup_path = consolidated_path.with_suffix('.xlsx.bak')
    df_existing.to_excel(backup_path, index=False)
    print(f"\n💾 Backup saved: {backup_path}")

    df_merged.to_excel(consolidated_path, sheet_name='All Data (Long)', index=False)
    print(f"✓ Updated: {consolidated_path}")

    print("\n" + "=" * 70)
    print("DONE - Ready to re-run notebook")
    print("=" * 70)


if __name__ == '__main__':
    main()
