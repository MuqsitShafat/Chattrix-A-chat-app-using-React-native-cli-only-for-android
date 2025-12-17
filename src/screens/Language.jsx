import {changeLanguage} from '../i18n/i18n';
import { I18nManager } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import React, {useState, useEffect} from 'react';
import { useTranslation } from 'react-i18next';

const Language_screen = ({navigation}) => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [searchText, setSearchText] = useState('');
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch languages from REST Countries API
  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,languages,flag');
      const countries = await response.json();
      
      // Extract unique languages
      const languageSet = new Set();
      const languageList = [];
      
      countries.forEach(country => {
        if (country.languages) {
          Object.values(country.languages).forEach(language => {
            if (!languageSet.has(language)) {
              languageSet.add(language);
              languageList.push({
                name: language,
                flag: country.flag || '🏳️', // Use country flag or default
                country: country.name.common,
              });
            }
          });
        }
      });
      
      // Sort languages alphabetically
      languageList.sort((a, b) => a.name.localeCompare(b.name));
      
      setLanguages(languageList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching languages:', error);
      setLoading(false);
      // Fallback to default languages if API fails
      setLanguages([
        {name: 'Arabic', flag: '🇸🇦', country: 'Saudi Arabia'},
        {name: 'Spanish', flag: '🇪🇸', country: 'Spain'},
        {name: 'French', flag: '🇫🇷', country: 'France'},
        {name: 'German', flag: '🇩🇪', country: 'Germany'},
        {name: 'Hindi', flag: '🇮🇳', country: 'India'},
        {name: 'Korean', flag: '🇰🇷', country: 'South Korea'},
        {name: 'English', flag: '🇺🇸', country: 'United States'},
        {name: 'Chinese', flag: '🇨🇳', country: 'China'},
        {name: 'Japanese', flag: '🇯🇵', country: 'Japan'},
        {name: 'Portuguese', flag: '🇵🇹', country: 'Portugal'},
      ]);
    }
  };

  const filteredLanguages = languages.filter(language =>
    language.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Move selected language to top of the list
  const sortedLanguages = [...filteredLanguages].sort((a, b) => {
    if (a.name === selectedLanguage) return -1;
    if (b.name === selectedLanguage) return 1;
    return a.name.localeCompare(b.name);
  });

  const selectLanguage = (languageName) => {
    setSelectedLanguage(languageName);
  };

const handleContinue = async () => {
  // Map selectedLanguage name to your i18n code
  const langMap = {
    English: 'en',
    Urdu: 'ur',
    French: 'fr',
    Spanish: 'es',
    Hindi: 'hi',
    Arabic: 'ar', 
    German: 'de', // optional
    Korean: 'ko', // optional
    Chinese: 'zh', // optional
    Japanese: 'ja', // optional
    Portuguese: 'pt', // optional
  };

  const langCode = langMap[selectedLanguage] || 'en';

  await changeLanguage(langCode);

  Alert.alert(
    'Language Changed',
    `Language changed to ${selectedLanguage}. If layout changed (RTL), please restart the app.`,
    [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ],
    { cancelable: false }
  );
};


  const goBack = () => {
    navigation.goBack();
  };

  const getSelectedLanguageFlag = () => {
    const selected = languages.find(lang => lang.name === selectedLanguage);
    return selected ? selected.flag : '🇸🇦';
  };

  return (
    <View style={styles.container}>
      {/* Top Row with back button */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={goBack}>
          <Image source={require('../images/Frame.png')} />
        </TouchableOpacity>
        <View style={styles.placeholder}></View>
      </View>

      {/* Cloudy Shade */}
      <LinearGradient
        colors={[
          'rgba(81, 13, 192, 0.4)',
          'rgba(81, 13, 192, 0.25)', 
          'rgba(81, 13, 192, 0.1)',
          'rgba(81, 13, 192, 0.05)',
          'transparent'
        ]}
        locations={[0, 0.3, 0.6, 0.8, 1]}
        style={styles.cloudyShade}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{t('choose_language')}</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>
         {t('select_preferred_language')}
        </Text>

        {/* You Selected Section */}
        <Text style={styles.sectionTitle}>{t('you_selected')}</Text>
        <TouchableOpacity style={styles.selectedLanguageContainer}>
          <View style={styles.languageRow}>
            <Text style={styles.flagEmoji}>{getSelectedLanguageFlag()}</Text>
            <Text style={styles.languageText}>{selectedLanguage}</Text>
          </View>
          <View style={styles.checkIcon}>
            <Icon name="checkmark-circle" size={24} color="#510DC0" />
          </View>
        </TouchableOpacity>

        {/* All Languages Section */}
        <Text style={styles.sectionTitle}>{t('all_languages')}</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#000000" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search')}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        {/* Languages List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#510DC0" />
            <Text style={styles.loadingText}>{t('loading_languages')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.languagesList} showsVerticalScrollIndicator={false}>
            {sortedLanguages.map((language, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.name && styles.selectedLanguageItem
                ]}
                onPress={() => selectLanguage(language.name)}
              >
                <View style={styles.languageRow}>
                  <Text style={styles.flagEmoji}>{language.flag}</Text>
                  <Text style={styles.languageText}>{language.name}</Text>
                </View>
                {selectedLanguage === language.name && (
                  <View style={styles.checkIcon}>
                    <Icon name="checkmark-circle" size={24} color="#510DC0" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: StatusBar.currentHeight + 10,
    zIndex: 2,
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Poppins-Regular',
    lineHeight: 22,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'Poppins-Medium',
    marginBottom: 15,
  },
  selectedLanguageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#510DC0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchContainer: {
    backgroundColor: '#fffffff5',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: 'black',
  },
  languagesList: {
    flex: 1,
    marginBottom: 20,
  },
  languageItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedLanguageItem: {
    backgroundColor: '#EBFAFB',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
    resizeMode: 'contain',
  },
  flagEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  languageText: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  checkIcon: {
    marginLeft: 10,
  },
  continueButton: {
    backgroundColor: '#510DC0',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  cloudyShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    zIndex: 0,
  },
});

export default Language_screen;