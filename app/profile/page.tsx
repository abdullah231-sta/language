"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaEdit, FaSave, FaTimes, FaGlobe, FaGraduationCap, FaUser, FaEnvelope, FaCalendarAlt, FaCamera } from 'react-icons/fa';
import Link from 'next/link';
import ConversationStats from '@/components/ConversationStats';

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    email: user?.email || '',
    nationality: user?.nationality || '',
    nativeLanguage: user?.nativeLanguage || '',
    targetLanguages: user?.targetLanguages || [''],
    level: user?.level || 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState('');

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
  ];

  const countries = [
    'AD', 'AE', 'AF', 'AG', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AZ', 'BA', 'BB', 'BD', 'BE',
    'BF', 'BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CD',
    'CF', 'CG', 'CH', 'CI', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CY', 'CZ', 'DE', 'DJ',
    'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FR',
    'GA', 'GB', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GW', 'GY', 'HN', 'HR', 'HT',
    'HU', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IR', 'IS', 'IT', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH',
    'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT',
    'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MR', 'MT',
    'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR',
    'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PR', 'PT', 'PW', 'PY', 'QA', 'RO',
    'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO',
    'SR', 'ST', 'SV', 'SY', 'SZ', 'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT',
    'TV', 'TZ', 'UA', 'UG', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VN', 'VU', 'WS', 'YE', 'ZA',
    'ZM', 'ZW'
  ];

  const countryNames: { [key: string]: string } = {
    'AD': 'Andorra',
    'AE': 'United Arab Emirates',
    'AF': 'Afghanistan',
    'AG': 'Antigua and Barbuda',
    'AL': 'Albania',
    'AM': 'Armenia',
    'AO': 'Angola',
    'AR': 'Argentina',
    'AT': 'Austria',
    'AU': 'Australia',
    'AZ': 'Azerbaijan',
    'BA': 'Bosnia and Herzegovina',
    'BB': 'Barbados',
    'BD': 'Bangladesh',
    'BE': 'Belgium',
    'BF': 'Burkina Faso',
    'BG': 'Bulgaria',
    'BH': 'Bahrain',
    'BI': 'Burundi',
    'BJ': 'Benin',
    'BN': 'Brunei',
    'BO': 'Bolivia',
    'BR': 'Brazil',
    'BS': 'Bahamas',
    'BT': 'Bhutan',
    'BW': 'Botswana',
    'BY': 'Belarus',
    'BZ': 'Belize',
    'CA': 'Canada',
    'CD': 'Democratic Republic of the Congo',
    'CF': 'Central African Republic',
    'CG': 'Republic of the Congo',
    'CH': 'Switzerland',
    'CI': 'Côte d\'Ivoire',
    'CL': 'Chile',
    'CM': 'Cameroon',
    'CN': 'China',
    'CO': 'Colombia',
    'CR': 'Costa Rica',
    'CU': 'Cuba',
    'CV': 'Cape Verde',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DE': 'Germany',
    'DJ': 'Djibouti',
    'DK': 'Denmark',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'DZ': 'Algeria',
    'EC': 'Ecuador',
    'EE': 'Estonia',
    'EG': 'Egypt',
    'ER': 'Eritrea',
    'ES': 'Spain',
    'ET': 'Ethiopia',
    'FI': 'Finland',
    'FJ': 'Fiji',
    'FK': 'Falkland Islands',
    'FM': 'Micronesia',
    'FR': 'France',
    'GA': 'Gabon',
    'GB': 'United Kingdom',
    'GD': 'Grenada',
    'GE': 'Georgia',
    'GH': 'Ghana',
    'GM': 'Gambia',
    'GN': 'Guinea',
    'GQ': 'Equatorial Guinea',
    'GR': 'Greece',
    'GT': 'Guatemala',
    'GW': 'Guinea-Bissau',
    'GY': 'Guyana',
    'HN': 'Honduras',
    'HR': 'Croatia',
    'HT': 'Haiti',
    'HU': 'Hungary',
    'ID': 'Indonesia',
    'IE': 'Ireland',
    'IL': 'Israel',
    'IN': 'India',
    'IQ': 'Iraq',
    'IR': 'Iran',
    'IS': 'Iceland',
    'IT': 'Italy',
    'JM': 'Jamaica',
    'JO': 'Jordan',
    'JP': 'Japan',
    'KE': 'Kenya',
    'KG': 'Kyrgyzstan',
    'KH': 'Cambodia',
    'KI': 'Kiribati',
    'KM': 'Comoros',
    'KN': 'Saint Kitts and Nevis',
    'KP': 'North Korea',
    'KR': 'South Korea',
    'KW': 'Kuwait',
    'KZ': 'Kazakhstan',
    'LA': 'Laos',
    'LB': 'Lebanon',
    'LC': 'Saint Lucia',
    'LI': 'Liechtenstein',
    'LK': 'Sri Lanka',
    'LR': 'Liberia',
    'LS': 'Lesotho',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'LV': 'Latvia',
    'LY': 'Libya',
    'MA': 'Morocco',
    'MC': 'Monaco',
    'MD': 'Moldova',
    'ME': 'Montenegro',
    'MG': 'Madagascar',
    'MH': 'Marshall Islands',
    'MK': 'North Macedonia',
    'ML': 'Mali',
    'MM': 'Myanmar',
    'MN': 'Mongolia',
    'MR': 'Mauritania',
    'MT': 'Malta',
    'MU': 'Mauritius',
    'MV': 'Maldives',
    'MW': 'Malawi',
    'MX': 'Mexico',
    'MY': 'Malaysia',
    'MZ': 'Mozambique',
    'NA': 'Namibia',
    'NC': 'New Caledonia',
    'NE': 'Niger',
    'NG': 'Nigeria',
    'NI': 'Nicaragua',
    'NL': 'Netherlands',
    'NO': 'Norway',
    'NP': 'Nepal',
    'NR': 'Nauru',
    'NZ': 'New Zealand',
    'OM': 'Oman',
    'PA': 'Panama',
    'PE': 'Peru',
    'PF': 'French Polynesia',
    'PG': 'Papua New Guinea',
    'PH': 'Philippines',
    'PK': 'Pakistan',
    'PL': 'Poland',
    'PR': 'Puerto Rico',
    'PT': 'Portugal',
    'PW': 'Palau',
    'PY': 'Paraguay',
    'QA': 'Qatar',
    'RO': 'Romania',
    'RS': 'Serbia',
    'RU': 'Russia',
    'RW': 'Rwanda',
    'SA': 'Saudi Arabia',
    'SB': 'Solomon Islands',
    'SC': 'Seychelles',
    'SD': 'Sudan',
    'SE': 'Sweden',
    'SG': 'Singapore',
    'SI': 'Slovenia',
    'SK': 'Slovakia',
    'SL': 'Sierra Leone',
    'SM': 'San Marino',
    'SN': 'Senegal',
    'SO': 'Somalia',
    'SR': 'Suriname',
    'ST': 'São Tomé and Príncipe',
    'SV': 'El Salvador',
    'SY': 'Syria',
    'SZ': 'Eswatini',
    'TD': 'Chad',
    'TG': 'Togo',
    'TH': 'Thailand',
    'TJ': 'Tajikistan',
    'TL': 'Timor-Leste',
    'TM': 'Turkmenistan',
    'TN': 'Tunisia',
    'TO': 'Tonga',
    'TR': 'Turkey',
    'TT': 'Trinidad and Tobago',
    'TV': 'Tuvalu',
    'TZ': 'Tanzania',
    'UA': 'Ukraine',
    'UG': 'Uganda',
    'US': 'United States',
    'UY': 'Uruguay',
    'UZ': 'Uzbekistan',
    'VA': 'Vatican City',
    'VC': 'Saint Vincent and the Grenadines',
    'VE': 'Venezuela',
    'VN': 'Vietnam',
    'VU': 'Vanuatu',
    'WS': 'Samoa',
    'YE': 'Yemen',
    'ZA': 'South Africa',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe'
  };

  const countryFlags: { [key: string]: string } = {
    'AD': '��', 'AE': '🇦🇪', 'AF': '🇦🇫', 'AG': '��🇬', 'AL': '�🇱', 'AM': '��', 'AO': '�🇦🇴', 'AR': '🇦🇷', 'AT': '🇦🇹', 'AU': '🇦🇺',
    'AZ': '🇦🇿', 'BA': '🇧🇦', 'BB': '🇧🇧', 'BD': '��🇩', 'BE': '��🇪', 'BF': '��', 'BG': '��', 'BH': '��', 'BI': '��', 'BJ': '��',
    'BN': '🇧�', 'BO': '��', 'BR': '��', 'BS': '��🇸', 'BT': '�🇹', 'BW': '��', 'BY': '🇧🇾', 'BZ': '🇧🇿', 'CA': '🇨🇦', 'CD': '��',
    'CF': '��🇫', 'CG': '�🇬', 'CH': '��', 'CI': '��', 'CL': '��🇱', 'CM': '�🇲', 'CN': '🇨🇳', 'CO': '🇨🇴', 'CR': '��', 'CU': '��🇺',
    'CV': '�🇻', 'CY': '��', 'CZ': '🇨🇿', 'DE': '🇩🇪', 'DJ': '🇩🇯', 'DK': '�🇰', 'DM': '��', 'DO': '�🇴', 'DZ': '🇩🇿', 'EC': '🇪🇨',
    'EE': '🇪🇪', 'EG': '�🇬', 'ER': '�🇷', 'ES': '��🇸', 'ET': '�🇹', 'FI': '🇫�🇮', 'FJ': '🇫🇯', 'FK': '🇫🇰', 'FM': '🇫🇲', 'FR': '🇫🇷',
    'GA': '��', 'GB': '��', 'GD': '��', 'GE': '🇬�', 'GH': '��', 'GM': '��', 'GN': '�🇳', 'GQ': '��', 'GR': '�🇷', 'GT': '��',
    'GW': '��', 'GY': '�🇾', 'HN': '��', 'HR': '🇭🇷', 'HT': '🇭🇹', 'HU': '🇭🇺', 'ID': '🇮🇩', 'IE': '��', 'IL': '🇮🇱', 'IN': '🇮🇳',
    'IQ': '��', 'IR': '��', 'IS': '��', 'IT': '🇮🇹', 'JM': '�🇲', 'JO': '🇯🇴', 'JP': '🇯🇵', 'KE': '🇰🇪', 'KG': '🇰🇬', 'KH': '🇰🇭',
    'KI': '��', 'KM': '��', 'KN': '🇰🇳', 'KP': '�🇵', 'KR': '��', 'KW': '��', 'KZ': '��', 'LA': '�🇦', 'LB': '��', 'LC': '��',
    'LI': '��', 'LK': '🇱🇰', 'LR': '�🇷', 'LS': '��', 'LT': '��', 'LU': '��', 'LV': '��', 'LY': '🇱🇾', 'MA': '��', 'MC': '��',
    'MD': '��', 'ME': '��', 'MG': '�🇬', 'MH': '��', 'MK': '��', 'ML': '��', 'MM': '��', 'MN': '��', 'MR': '��', 'MT': '🇲🇹',
    'MU': '🇲�', 'MV': '🇲�', 'MW': '🇲�', 'MX': '🇲�', 'MY': '��', 'MZ': '��', 'NA': '🇳🇦', 'NC': '🇳🇨', 'NE': '�🇪', 'NG': '��',
    'NI': '��', 'NL': '��', 'NO': '��', 'NP': '��', 'NR': '��', 'NZ': '��', 'OM': '��', 'PA': '��', 'PE': '��', 'PF': '��',
    'PG': '��', 'PH': '��', 'PK': '��', 'PL': '��', 'PR': '�🇷', 'PT': '🇵�', 'PW': '��', 'PY': '��', 'QA': '��', 'RO': '�🇴',
    'RS': '🇷🇸', 'RU': '🇷�', 'RW': '🇷🇼', 'SA': '��', 'SB': '🇸🇧', 'SC': '🇸�', 'SD': '�🇩', 'SE': '��', 'SG': '��', 'SI': '��',
    'SK': '🇸🇰', 'SL': '🇸�', 'SM': '�🇲', 'SN': '🇸🇳', 'SO': '🇸🇴', 'SR': '🇸�', 'ST': '🇸🇹', 'SV': '🇸🇻', 'SY': '🇸🇾', 'SZ': '�🇿',
    'TD': '��', 'TG': '�🇬', 'TH': '��', 'TJ': '��', 'TL': '��', 'TM': '��', 'TN': '��', 'TO': '🇹🇴', 'TR': '🇹🇷', 'TT': '��',
    'TV': '🇹🇻', 'TZ': '🇹🇿', 'UA': '🇺🇦', 'UG': '🇺🇬', 'US': '🇺🇸', 'UY': '🇺🇾', 'UZ': '🇺🇿', 'VA': '🇻🇦', 'VC': '🇻🇨', 'VE': '🇻🇪',
    'VN': '🇻🇳', 'VU': '🇻�', 'WS': '🇼🇸', 'YE': '🇾🇪', 'ZA': '��', 'ZM': '�🇲', 'ZW': '��'
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h2>
          <Link 
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleTargetLanguageChange = (index: number, value: string) => {
    const newTargetLanguages = [...formData.targetLanguages];
    newTargetLanguages[index] = value;
    setFormData({
      ...formData,
      targetLanguages: newTargetLanguages
    });
  };

  const addTargetLanguage = () => {
    if (formData.targetLanguages.length < 3) {
      setFormData({
        ...formData,
        targetLanguages: [...formData.targetLanguages, '']
      });
    }
  };

  const removeTargetLanguage = (index: number) => {
    if (formData.targetLanguages.length > 1) {
      const newTargetLanguages = formData.targetLanguages.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        targetLanguages: newTargetLanguages
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select a valid image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size should be less than 5MB' });
        return;
      }

      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous image errors
      if (errors.image) {
        const newErrors = { ...errors };
        delete newErrors.image;
        setErrors(newErrors);
      }
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setProfileImage(user?.avatar || null);
    setImageFile(null);
    setFormData({
      firstName: user!.firstName,
      lastName: user!.lastName,
      username: user!.username,
      email: user!.email,
      nationality: user!.nationality,
      nativeLanguage: user!.nativeLanguage,
      targetLanguages: user!.targetLanguages.length > 0 ? user!.targetLanguages : [''],
      level: user!.level
    });
    setErrors({});
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(user?.avatar || null);
    setImageFile(null);
    setErrors({});
    setSuccess('');
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.nativeLanguage) {
      newErrors.nativeLanguage = 'Please select your native language';
    }
    if (!formData.targetLanguages[0]) {
      newErrors.targetLanguages = 'Please select at least one target language';
    }
    if (!formData.nationality) {
      newErrors.nationality = 'Please select your nationality';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const updates: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      nationality: formData.nationality,
      nativeLanguage: formData.nativeLanguage,
      targetLanguages: formData.targetLanguages.filter(lang => lang !== ''),
      level: formData.level
    };

    // Add avatar if image was changed
    if (imageFile || profileImage !== user?.avatar) {
      updates.avatar = profileImage;
    }

    const result = await updateProfile(updates);

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setImageFile(null);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setErrors({ general: result.error || 'Failed to update profile' });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account settings and language preferences</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center space-x-2">
            <span className="text-lg">✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {(profileImage || user.avatar) ? (
                    <img 
                      src={profileImage || user.avatar} 
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl text-gray-600 font-bold">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  )}
                </div>
                
                {/* Country Flag Display - Preview in Edit Mode or Live Display */}
                {((isEditing && formData.nationality && countryFlags[formData.nationality]) || 
                  (!isEditing && user.nationality && countryFlags[user.nationality])) && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200">
                    <span className="text-lg sm:text-xl">
                      {isEditing ? countryFlags[formData.nationality] : countryFlags[user.nationality]}
                    </span>
                  </div>
                )}
                
                {/* Image Upload Button (only in edit mode) */}
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <label 
                      htmlFor="profile-image-upload"
                      className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg border-2 border-white"
                    >
                      <FaCamera className="text-sm" />
                    </label>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-blue-100 text-lg">@{user.username}</p>
                <div className="flex items-center justify-center sm:justify-start space-x-2 mt-2 text-blue-100">
                  <FaCalendarAlt className="text-sm" />
                  <span className="text-sm">Joined {formatDate(user.joinedAt)}</span>
                </div>
                
                {/* Image Upload Error */}
                {errors.image && (
                  <p className="mt-2 text-sm text-red-300 bg-red-900/30 px-3 py-1 rounded">
                    {errors.image}
                  </p>
                )}

                {/* Image Upload Instructions (only in edit mode) */}
                {isEditing && (
                  <div className="mt-4 text-center sm:text-left">
                    <p className="text-blue-100 text-sm mb-3">Click the camera icon to upload a custom profile picture</p>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileImage(null);
                          setImageFile(null);
                        }}
                        className="px-3 py-1 text-xs bg-red-600/20 text-red-200 rounded border border-red-500/30 hover:bg-red-600/30 transition-colors"
                      >
                        Remove Picture
                      </button>
                      <span className="text-blue-200 text-xs self-center">
                        Max size: 5MB • JPG, PNG, GIF
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                {!isEditing ? (
                  <button
                    onClick={handleEditStart}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <FaEdit />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <FaSave />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 sm:p-8">
            {!isEditing ? (
              // View Mode
              <div className="space-y-8">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <FaUser />
                      <span>Personal Details</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Email Address</label>
                        <div className="text-white font-medium">{user.email}</div>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Nationality</label>
                        <div className="text-white font-medium flex items-center space-x-2">
                          {countryFlags[user.nationality] && (
                            <span className="text-xl">{countryFlags[user.nationality]}</span>
                          )}
                          <span>{countryNames[user.nationality] || 'Country not specified'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <FaGlobe />
                      <span>Language Profile</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Native Language</label>
                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium inline-block">
                          {user.nativeLanguage}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Learning Level</label>
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium inline-block">
                          <FaGraduationCap className="inline mr-2" />
                          {user.level}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Target Languages</label>
                        <div className="flex flex-wrap gap-2">
                          {user.targetLanguages.map((lang, index) => (
                            <span 
                              key={index}
                              className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversation Stats */}
                <div className="mt-8">
                  <ConversationStats compact={true} showModal={true} />
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-6">
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2">
                    <span className="text-lg">❌</span>
                    <span>{errors.general}</span>
                  </div>
                )}

                {/* Personal Information Edit */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                        }`}
                        placeholder="Enter your username"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                      <div className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed">
                        {user.email}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed for security reasons</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-300 text-sm font-medium mb-2">Nationality</label>
                      <select
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          errors.nationality ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">Select your country</option>
                        {countries.map(country => (
                          <option key={country} value={country} className="bg-gray-700">
                            {countryNames[country] || 'Unknown Country'}
                          </option>
                        ))}
                      </select>
                      {errors.nationality && (
                        <p className="mt-1 text-sm text-red-400">{errors.nationality}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Language Information Edit */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Language Preferences</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Native Language</label>
                      <select
                        name="nativeLanguage"
                        value={formData.nativeLanguage}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                          errors.nativeLanguage ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                        }`}
                      >
                        <option value="">Select your native language</option>
                        {languages.map(language => (
                          <option key={language} value={language} className="bg-gray-700">{language}</option>
                        ))}
                      </select>
                      {errors.nativeLanguage && (
                        <p className="mt-1 text-sm text-red-400">{errors.nativeLanguage}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Languages to Learn</label>
                      {formData.targetLanguages.map((targetLang, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <select
                            value={targetLang}
                            onChange={(e) => handleTargetLanguageChange(index, e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="">Select a language</option>
                            {languages.filter(lang => lang !== formData.nativeLanguage && !formData.targetLanguages.includes(lang) || lang === targetLang).map(language => (
                              <option key={language} value={language} className="bg-gray-700">{language}</option>
                            ))}
                          </select>
                          {formData.targetLanguages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTargetLanguage(index)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            >
                              ❌
                            </button>
                          )}
                        </div>
                      ))}
                      {formData.targetLanguages.length < 3 && (
                        <button
                          type="button"
                          onClick={addTargetLanguage}
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          + Add another language
                        </button>
                      )}
                      {errors.targetLanguages && (
                        <p className="mt-1 text-sm text-red-400">{errors.targetLanguages}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Learning Level</label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="Beginner" className="bg-gray-700">Beginner</option>
                        <option value="Intermediate" className="bg-gray-700">Intermediate</option>
                        <option value="Advanced" className="bg-gray-700">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}