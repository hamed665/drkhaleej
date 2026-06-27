import { describe, expect, it } from 'vitest';

import { cleanConfigBrand } from './configBrand';
import type { PublicDiscoveryPageConfig } from './publicDiscoveryPageConfig';

const legacyNames = ['DrMuscat', 'Dr Muscat', 'Doctor Muscat', 'دکتر مسقط', 'دكتور مسقط', 'د. مسقط'];

function stringify(value: unknown): string {
  return JSON.stringify(value);
}

describe('cleanConfigBrand', () => {
  it('normalizes nested discovery config strings', () => {
    const config = {
      locale: 'en',
      country: 'om',
      dir: 'ltr',
      categoryType: 'offers',
      path: '/offers',
      searchId: 'search',
      resultsId: 'results',
      badge: 'DrMuscat offers',
      title: 'Doctor Muscat title',
      subtitle: 'دكتور مسقط subtitle',
      primaryCta: 'Search',
      providerCta: 'List',
      search: {
        badge: 'Search',
        title: 'Dr Muscat search',
        description: 'دکتر مسقط description',
        inputLabel: 'Input',
        placeholder: 'Placeholder',
        button: 'Button',
        legend: 'Legend',
        moreFilters: 'More',
        moreLegend: 'More legend',
        countryLabel: 'Country',
        cityLabel: 'City',
        areaLabel: 'Area',
        suggestionLabel: 'Suggestions',
        useSuggestion: 'Use',
        contentType: 'Offers',
        trustAria: 'Trust',
        trust: ['د. مسقط trust'],
        mainChips: ['Main'],
        moreChips: ['More'],
        countryOptions: ['Oman'],
        cityOptions: ['Muscat'],
        areaOptions: ['Qurum'],
        defaultCountry: 'Oman',
        defaultCity: 'Muscat',
        defaultArea: 'Qurum',
        suggestions: []
      },
      results: {
        title: 'Results',
        emptyText: 'No DrMuscat results'
      },
      visual: {
        label: 'Visual',
        previous: 'Previous',
        next: 'Next',
        slideLabel: 'Slide',
        slides: [{ src: '/x.webp', alt: 'Doctor Muscat image', caption: 'DrMuscat caption' }]
      }
    } satisfies PublicDiscoveryPageConfig;

    const output = stringify(cleanConfigBrand(config));

    expect(output).toContain('DrKhaleej');
    for (const legacyName of legacyNames) {
      expect(output).not.toContain(legacyName);
    }
  });
});
