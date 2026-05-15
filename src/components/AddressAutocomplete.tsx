import { MapPin, Search, X } from 'lucide-react-native';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppContext from '../context/AppContext';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    road?: string;
    house_number?: string;
  };
}

interface AddressAutocompleteProps {
  placeholder: string;
  value: string;
  onSelect: (item: { displayName: string; city: string; lat: string; lon: string }) => void;
  onChangeText?: (text: string) => void;
  style?: any;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export default function AddressAutocomplete({
  placeholder,
  value,
  onSelect,
  onChangeText,
  style,
}: AddressAutocompleteProps) {
  const { isDark } = useContext(AppContext);

  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSelected, setIsSelected] = useState(!!value);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes (e.g. from AI parsing)
  useEffect(() => {
    setQuery(value);
    if (value) setIsSelected(true);
  }, [value]);

  const searchAddress = useCallback(async (text: string) => {
    if (text.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: text,
        format: 'json',
        addressdetails: '1',
        limit: '6',
        'accept-language': 'ru',
      });

      const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
        headers: {
          'User-Agent': 'VostokCargo/1.0',
        },
      });

      if (!response.ok) throw new Error('Nominatim error');
      const data: NominatimResult[] = await response.json();
      setResults(data);
      setShowDropdown(data.length > 0);
    } catch (err) {
      console.log('Nominatim search error:', err);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    setIsSelected(false);
    onChangeText?.(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchAddress(text);
    }, 400);
  };

  const handleSelect = (item: NominatimResult) => {
    const city =
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      '';

    const displayName = item.display_name;

    setQuery(displayName);
    setIsSelected(true);
    setShowDropdown(false);
    setResults([]);
    Keyboard.dismiss();

    onSelect({
      displayName,
      city,
      lat: item.lat,
      lon: item.lon,
    });
  };

  const handleClear = () => {
    setQuery('');
    setIsSelected(false);
    setResults([]);
    setShowDropdown(false);
    onChangeText?.('');
  };

  const formatDisplayName = (name: string) => {
    // Shorten very long display names for the dropdown
    const parts = name.split(', ');
    if (parts.length > 4) {
      return parts.slice(0, 4).join(', ') + '…';
    }
    return name;
  };

  const renderItem = ({ item }: { item: NominatimResult }) => {
    const cityName =
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      '';

    return (
      <TouchableOpacity
        style={[
          localStyles.dropdownItem,
          isDark && localStyles.dropdownItemDark,
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={localStyles.dropdownItemIcon}>
          <MapPin size={16} color={isDark ? '#60a5fa' : '#3b82f6'} />
        </View>
        <View style={localStyles.dropdownItemContent}>
          <Text
            style={[
              localStyles.dropdownItemTitle,
              isDark && localStyles.dropdownItemTitleDark,
            ]}
            numberOfLines={2}
          >
            {formatDisplayName(item.display_name)}
          </Text>
          {cityName ? (
            <Text style={localStyles.dropdownItemSubtitle}>
              {cityName}
              {item.address?.state ? `, ${item.address.state}` : ''}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={localStyles.container}>
      <View
        style={[
          localStyles.inputWrapper,
          isDark && localStyles.inputWrapperDark,
          showDropdown && localStyles.inputWrapperActive,
          isSelected && localStyles.inputWrapperSelected,
          style,
        ]}
      >
        <Search
          size={16}
          color={isSelected ? '#22c55e' : isDark ? '#6b7280' : '#9ca3af'}
          style={localStyles.searchIcon}
        />
        <TextInput
          style={[
            localStyles.input,
            isDark && localStyles.inputDark,
          ]}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => {
            if (results.length > 0 && !isSelected) {
              setShowDropdown(true);
            }
          }}
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#3b82f6"
            style={localStyles.loader}
          />
        )}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} style={localStyles.clearBtn}>
            <X size={16} color={isDark ? '#6b7280' : '#9ca3af'} />
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && (
        <View
          style={[
            localStyles.dropdown,
            isDark && localStyles.dropdownDark,
          ]}
        >
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.place_id)}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={localStyles.dropdownList}
          />
          <View style={[localStyles.attribution, isDark && localStyles.attributionDark]}>
            <Text style={localStyles.attributionText}>
              © OpenStreetMap contributors
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputWrapperDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  inputWrapperActive: {
    borderColor: '#3b82f6',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  inputWrapperSelected: {
    borderColor: '#86efac',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    color: '#111827',
  },
  inputDark: {
    color: '#f9fafb',
  },
  loader: {
    marginLeft: 8,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#3b82f6',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 260,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    overflow: 'hidden',
  },
  dropdownDark: {
    backgroundColor: '#1f2937',
    borderColor: '#3b82f6',
  },
  dropdownList: {
    maxHeight: 230,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemDark: {
    borderBottomColor: '#374151',
  },
  dropdownItemIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },
  dropdownItemTitleDark: {
    color: '#f9fafb',
  },
  dropdownItemSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  attribution: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fafafa',
  },
  attributionDark: {
    borderTopColor: '#374151',
    backgroundColor: '#111827',
  },
  attributionText: {
    fontSize: 10,
    color: '#9ca3af',
  },
});
