import { ChevronLeft, Lock, Shield, Eye, UserCheck } from 'lucide-react-native';
import React, { useContext } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AppContext from '../../context/AppContext';
import styles from '../../styles/appStyles';
import { t } from '../../utils/i18n';

export default function Privacy() {
  const { navigate, isDark, language } = useContext(AppContext);

  const sections = [
    { titleKey: 'privacy.section1.title', textKey: 'privacy.section1.text', icon: Eye },
    { titleKey: 'privacy.section2.title', textKey: 'privacy.section2.text', icon: Shield },
    { titleKey: 'privacy.section3.title', textKey: 'privacy.section3.text', icon: Lock },
    { titleKey: 'privacy.section4.title', textKey: 'privacy.section4.text', icon: UserCheck },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>
      <View style={[styles.row, styles.mb6]}>
        <TouchableOpacity onPress={() => navigate('Menu')} style={styles.mr3}>
          <ChevronLeft size={28} color={isDark ? '#f9fafb' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.screenTitleNoMargin, isDark && styles.textWhite]}>
          {t('privacy.title', language)}
        </Text>
      </View>

      {sections.map((section, index) => {
        const Icon = section.icon;
        return (
          <View key={index} style={[styles.card, isDark && styles.cardDark]}>
            <View style={[styles.row, styles.mb2]}>
              <View style={[styles.iconBoxBlue, isDark && { backgroundColor: '#1e3a5f' }]}>
                <Icon size={20} color="#3b82f6" />
              </View>
              <Text style={[styles.sectionTitle, styles.ml3, styles.mb0, isDark && styles.textWhite]}>
                {t(section.titleKey, language)}
              </Text>
            </View>
            <Text style={[styles.textGraySm, { lineHeight: 22 }, isDark && { color: '#9ca3af' }]}>
              {t(section.textKey, language)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
